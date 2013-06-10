/**
 * JSON-RPC2実装
 *
 * usage:
 * 
 */
import error = module('./error')

/**
 * JSON-RPCのmethodに渡されるcallback。
 * 成功時はonSuccessを呼び出し、失敗時はonFailureを呼び出す。
 */
export interface Callback {
	onSuccess(result: any) : void;
	onFailure(error: error.RPCError) : void;
}

/**
 * JSON-RPC method's interface
 */
export interface Method {
	(params:any, callback:Callback): void;	
}
