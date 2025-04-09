interface BaseResponseStrategy {
    handle(res: any): Promise<any>;
}