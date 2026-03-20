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
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
    cloudflare: {
      accountId: process.env.CF_ACCOUNT_ID,
      token: process.env.CF_IMAGES_TOKEN,
      accountHash: process.env.CF_ACCOUNT_HASH,
    },
  };
};
