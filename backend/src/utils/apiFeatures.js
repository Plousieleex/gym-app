class APIFeatures {
  constructor(queryString) {
    this.queryString = queryString;
    this.options = {};
  }

  // Filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFiles = ['page', 'sort', 'limit', 'fields'];
    excludedFiles.forEach(el => delete queryObj[el]);

    Object.keys(queryObj).forEach(key => {
      if (queryObj[key].match(/\(gte|gt|lte|lt)\b/)) {
        const [operator, value] = queryObj[key].split('_');
        queryObj[key] = { [operator]: Number(value) };
      }
    });

    this.options.where = queryObj;
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map(field => ({
        [field]: 'asc',
      }));
      this.options.orderBy = sortBy;
    } else {
      this.options.orderBy = { createdAt: 'desc' };
    }

    return this;
  }

  // Limiting Fields
  limitFields() {
    if (this.queryString.fields) {
      const fieldsArray = this.queryString.fields.split(',');
      this.options.select = fieldsArray.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
    }

    return this;
  }

  // Pagination
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.options.skip = skip;
    this.options.take = limit;

    return this;
  }

  getOptions() {
    return this.options;
  }
}

module.exports = APIFeatures;
