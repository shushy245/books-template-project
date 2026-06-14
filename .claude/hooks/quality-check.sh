#!/bin/bash
set -euo pipefail

INPUT=$(cat)

# Prevent infinite loops
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
    echo '{"decision": "approve"}'
    exit 0
fi

TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
    echo '{"decision": "approve"}'
    exit 0
fi

# Find TypeScript files edited in this session
EDITED_TS=$(while IFS= read -r line; do
    [ -z "$line" ] && continue
    tool_name=$(echo "$line" | jq -r '.message.content[]?.name // empty' 2>/dev/null || true)
    if [[ "$tool_name" =~ ^(Write|Edit)$ ]]; then
        file_path=$(echo "$line" | jq -r '.message.content[]?.input.file_path // empty' 2>/dev/null || true)
        if [ -n "$file_path" ] && [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
            echo "$file_path"
        fi
    fi
done < "$TRANSCRIPT_PATH" | sort -u)

# No TypeScript files touched — nothing to check
if [ -z "$EDITED_TS" ]; then
    echo '{"decision": "approve"}'
    exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Determine which packages need typechecking.
# common edits propagate to both consumers, so include all three.
TYPECHECK_RAW=""
while IFS= read -r f; do
    case "$f" in
        */packages/common/*)
            TYPECHECK_RAW="$TYPECHECK_RAW
@reading-room/common
@reading-room/frontend
@reading-room/backend"
            ;;
        */packages/frontend/*)
            TYPECHECK_RAW="$TYPECHECK_RAW
@reading-room/frontend"
            ;;
        */packages/backend/*)
            TYPECHECK_RAW="$TYPECHECK_RAW
@reading-room/backend"
            ;;
    esac
done <<< "$EDITED_TS"

TYPECHECK_PACKAGES=$(echo "$TYPECHECK_RAW" | sort -u | grep -v '^$' || true)

ERRORS=""

# Lint only the edited files (faster than project-wide pnpm lint)
LINT_OUTPUT=$(echo "$EDITED_TS" | xargs ./node_modules/.bin/eslint --max-warnings 0 2>&1) || ERRORS="$ERRORS
### Lint:
$LINT_OUTPUT"

# Typecheck only the packages that contain edited files
if [ -n "$TYPECHECK_PACKAGES" ]; then
    while IFS= read -r pkg; do
        [ -z "$pkg" ] && continue
        TYPE_OUTPUT=$(pnpm --filter "$pkg" typecheck 2>&1) || ERRORS="$ERRORS
### Typecheck ($pkg):
$TYPE_OUTPUT"
    done <<< "$TYPECHECK_PACKAGES"
fi

if [ -n "$ERRORS" ]; then
    REASON="Quality checks failed — fix before stopping:$ERRORS"
    echo "$REASON" | jq -Rs '{"decision": "block", "reason": .}'
    exit 0
fi

echo '{"decision": "approve"}'
