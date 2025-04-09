abstract class BaseProvider {
    sendStrategy?: BaseSendStrategy;
    responseStrategy?: BaseResponseStrategy; 

    constructor(){};

    setSendStragy(strategy: BaseSendStrategy){
        this.sendStrategy = strategy;
    }

    setResponseStragy(strategy: BaseResponseStrategy){
        this.responseStrategy = strategy;
    }

    abstract send(msg: any): Promise<any>;
    abstract _handle(response: any): Promise<any>;
}