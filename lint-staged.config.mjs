export default {
	'backend/**/*.{ts,js}': [
    "sh -c 'cd backend/users-service && npm exec -- eslint --fix \"$@\"' --",
    "sh -c 'cd backend/users-service && npm exec -- prettier --write \"$@\"' --"
  ],
};
