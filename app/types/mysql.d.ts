declare module 'mysql' {
    declare function createConnection(config: any): Connection;
    declare function createPool(config: any);

    interface QueryCallback {
        (err:any, result:any) : void;
    }
    class Connection {
        static createQuery(sql, values?, cb?): any;
        connect(cb?): void;
        changeUser(options, cb): any;
        query(sql, values?, cb?: QueryCallback): void;
        ping(cb): void;
        statistics(cb): void;
        end(cb): void;
        destroy(): void;
        pause(): void;
        resume(): void;
        escape(value): string;
        format(sql, values): string;
    } 
}
