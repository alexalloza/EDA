export abstract class AbstractConnection {
    config: any;
    pool: any

    constructor(config: any) {
        this.config = config;
    }

    itsConnected() {
        console.log('\x1b[36m%s\x1b[0m', 'Successfully connected to ' + this.config.type + ' database! \n');
    }

    async connect() {
        try {
            await this.tryConnection();
        } catch (e) {
            throw e;
        }
    }

    abstract async tryConnection(): Promise<void>;

    abstract async generateDataModel(): Promise<any>;

    abstract async execQuery(query: string): Promise<any>;

    abstract async getDataSource(id: string): Promise<any>;

    abstract async getQueryBuilded(queryData: any, dataModel: any, user: string): Promise<any>;

    abstract async getPool():Promise<any>;

}

