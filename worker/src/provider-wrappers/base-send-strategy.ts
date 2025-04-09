interface BaseSendStrategy {
    send(msg: any): Promise<any>;
}