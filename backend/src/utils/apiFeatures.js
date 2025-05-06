import prisma from '../config/db.js';

const deepConvertNumber = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepConvertNumber(obj[key]);
    } else if (!isNaN(obj[key])) {
      obj[key] = Number(obj[key]);
    }
  });
};

export default class APIFeatures {
  constructor(model, queryString) {
    this.model = prisma[model];
    this.queryString = queryString;

    this.options = {};
  }

  // Filtering
  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    const parsedQuery = JSON.parse(queryStr);

    deepConvertNumber(parsedQuery);

    this.options.where = parsedQuery;

    this.model.findMany(this.options);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((field) => {
        if (field.startsWith('-')) {
          return { [field.substring(1)]: 'desc' };
        } else {
          return { [field]: 'asc' };
        }
      });

      this.options.orderBy = sortBy;
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
      this.options.select = fields;
    } else {
      this.options.omit = { id: true, password: true };
    }

    return this;
  }

  paginate() {
    let page = Number(this.queryString.page) || 1;
    let limit = Number(this.queryString.limit) || 100;

    // FOR NEGATIVE NUMBERS
    page = page < 1 ? 1 : page;
    limit = limit < 1 ? 100 : limit;

    const skip = (page - 1) * limit;

    this.options.skip = skip;
    this.options.take = limit;

    return this;
  }

  async execute() {
    return await this.model.findMany(this.options);
  }
}
