export const resolvers = {
  Query: {
    quiz: () => {
      return fetch("https://opentdb.com/api.php?amount=10")
        .then((res) => res.json())
        .then((res) => res.results);
    },
  },
};
