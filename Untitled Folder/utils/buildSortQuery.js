/**
 * Builds MongoDB sorting object
 *
 * Examples:
 *
 * ?sort=reward
 * => { reward: 1 }
 *
 * ?sort=-reward
 * => { reward: -1 }
 *
 * ?sort=newest
 * => { createdAt: -1 }
 *
 */

const buildSortQuery = (query) => {
  const { sort } = query;

  // Default sorting
  if (!sort) {
    return {
      createdAt: -1,
    };
  }

  /*
    Predefined sorting options
    These are safer because the user
    cannot directly control database fields.
  */

  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    reward: {
      reward: -1,
    },

    deadline: {
      deadline: 1,
    },

    popular: {
      "submissions.count": -1,
    },
  };

  if (sortOptions[sort]) {
    return sortOptions[sort];
  }

  /*
    Allow advanced sorting:

    ?sort=-reward

    becomes:

    {
      reward:-1
    }

  */

  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const sortOrder = sort.startsWith("-") ? -1 : 1;

  /*
    Whitelist fields users can sort by

    Prevent:

    ?sort=password

    or

    ?sort=__v
  */

  const allowedSortFields = [
    "reward",
    "deadline",
    "createdAt",
    "winnersAllowed",
  ];

  if (!allowedSortFields.includes(sortField)) {
    return {
      createdAt: -1,
    };
  }

  return {
    [sortField]: sortOrder,
  };
};

module.exports = buildSortQuery;
