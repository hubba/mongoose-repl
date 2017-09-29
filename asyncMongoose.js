class AsyncMongoose {
    constructor(model) {
        this.model = model;
        this.isWritable = typeof model.schema.options.isWritable === 'undefined' ? true : model.schema.options.isWritable;
    }

    async find(query, {
        limit = -1,
        select = null,
        populate = null
    } = {}) {
        let findPromise = this.model.find(query);

        if (limit && typeof limit === 'number' && limit !== -1) {
            findPromise = findPromise.limit(limit);
        }

        if (select && typeof select === 'string') {
            findPromise = findPromise.select(select);
        }

        if (populate && (typeof populate === 'object' || typeof select === 'string')) {
            findPromise = findPromise.populate(populate);
        }

        return await findPromise;
    }

    async findOne(query, {
        select = null,
        populate = null
    } = {}) {
        let findOnePromise = this.model.findOne(query);

        if (select && typeof select === 'string') {
            findOnePromise = findOnePromise.select(select);
        }

        if (populate && (typeof populate === 'object' || typeof select === 'string')) {
            findOnePromise = findOnePromise.populate(populate);
        }

        return await findOnePromise;
    }

    async create(query) {
        if (!this.isWritable) {
            throw new Error('Sorry your model is not writable.');
        }

        return await this.model.create(query);
    }

    async setWhere(query, values) {
        if (!this.isWritable) {
            throw new Error('Sorry your model is not writable.');
        }

        return await this.model.update(query, {'$set': values}, {multi: true});
    }

    async findById(id, {
        select = null,
        populate = null
    } = {}) {
        let findByIdPromise = this.model.findById(id);

        if (select && typeof select === 'string') {
            findByIdPromise = findByIdPromise.select(select);
        }

        return await findByIdPromise;
    }
}

module.exports = AsyncMongoose;
