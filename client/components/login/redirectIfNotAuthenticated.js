export default store =>
    (nextState, replace) => {
        const { user: { authenticated } } = store.getState();

        if (!authenticated) {
            replace({
                pathname: '/sign-in',
                result: { nextPathname: nextState.location.pathname },
            });
        }
    };
