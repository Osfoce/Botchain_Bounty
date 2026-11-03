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
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 6);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10_000 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    const error = new Error("Invalid pagination parameters");
    error.status = 400;
    throw error;
  }

  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) {
    const error = new Error("Invalid pagination parameters");
    error.status = 400;
    throw error;
  }

  return {
    page,
    limit,
    skip,
  };
};

module.exports = paginate;
