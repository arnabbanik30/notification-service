class EmailProvider extends BaseProvider{
    async send(msg: any): Promise<any> {
        if (!this.sendStrategy){
            throw new Error("No Send Strategy has been provided");
        }
        const res = await this.sendStrategy?.send(msg);
        return await this._handle(res);
    }
    async _handle(response: any): Promise<any> {
        if (!this.responseStrategy){
            throw new Error("No Response Strategy has been provided");
        }
        return await this.responseStrategy.handle(response);
    }

}