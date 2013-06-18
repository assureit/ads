///<reference path='../DefinitelyTyped/node/node.d.ts'/>
declare module 'mysql' {
    import events = module('events')
    declare function createConnection(config: any): Connection;
    declare function createPool(config: any);

    interface QueryCallback {
        (err:any, result:any) : void;
    }
    class Connection extends events.EventEmitter {
    // class Connection implements EventEmitter {
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

        // // EventEmitter Interface
        // addListener(event: string, listener: Function);
        // on(event: string, listener: Function);
        // once(event: string, listener: Function): void;
        // removeListener(event: string, listener: Function): void;
        // removeAllListener(event: string): void;
        // setMaxListeners(n: number): void;
        // listeners(event: string):  {Function;}[];
        // emit(event: string, arg1?: any, arg2?: any): void;
    } 
}
