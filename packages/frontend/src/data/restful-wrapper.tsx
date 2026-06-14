import {
    RestfulChildProps,
    RestfulErrorProps,
    UseRestfulWrapperArgs,
    useRestfulWrapper,
} from './use-restful-wrapper.tsx';

type RestfulWrapperProps<T, A> = {
    fetch: (args: A) => Promise<T>;
    initialArgs: A;
    renderChild: (props: RestfulChildProps<T, A>) => JSX.Element;
    renderError?: (props: RestfulErrorProps<A>) => JSX.Element;
    renderLoader?: () => JSX.Element;
};

export const RestfulWrapper = <T, A>(props: RestfulWrapperProps<T, A>): JSX.Element => {
    const { fetch, initialArgs, renderChild } = props;
    const wrapperArgs: UseRestfulWrapperArgs<T, A> = { fetch, initialArgs };
    const { renderRestfulState } = useRestfulWrapper(wrapperArgs);

    return renderRestfulState({
        renderChild,
        ...(props.renderError !== undefined && { renderError: props.renderError }),
        ...(props.renderLoader !== undefined && { renderLoader: props.renderLoader }),
    });
};
