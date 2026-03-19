export default () => {
  const serverEnv = process.env.SERVER_ENV ?? 'development';
  return {
    app: {
      serverEnv: serverEnv,
      port: Number(process.env.PORT ?? 3001),
    },
    db: {
      url: process.env.DATABASE_URL!,
    },
    jwt: {
      accessSecret:
        serverEnv === 'development'
          ? process.env.DEV_JWT_ACCESS_SECRET
          : process.env.JWT_ACCESS_SECRET,
      refreshSecret:
        serverEnv === 'development'
          ? process.env.DEV_JWT_REFRESH_SECRET
          : process.env.JWT_REFRESH_SECRET,
    },
  };
};
