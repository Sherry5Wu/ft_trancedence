import { ReactNode, Component, ErrorInfo } from 'react';

export class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong...</h1>;
        }
        return this.props.children;
    }
}