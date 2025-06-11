declare const _default: (() => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    telegram: {
        botToken: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    telegram: {
        botToken: string;
    };
}>;
export default _default;
