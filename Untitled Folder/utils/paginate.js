/**
 * Handles pagination values
 *
 * Converts:
 *
 * ?page=2&limit=10
 *
 * into:
 *
 * {
 *   page:2,
 *   limit:10,
 *   skip:10
 * }
 *
 */

const paginate = (query) => {
  let { page = 1, limit = 6 } = query;

  page = Number(page);
  limit = Number(limit);

  /*
    Safety checks
  */

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = 6;
  }

  /*
    Prevent someone doing:

    ?limit=1000000

    and killing your server
  */

  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

module.exports = paginate;
