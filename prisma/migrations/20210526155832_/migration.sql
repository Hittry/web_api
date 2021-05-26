-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL', 'API');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type_token" "TokenType" NOT NULL,
    "emailToken" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DianonPerson" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "social" JSONB,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "personID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "date" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistinctiveFeatures" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "tato" TEXT,
    "colour" TEXT,
    "sex" TEXT NOT NULL,
    "injury" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "passport" TEXT,
    "marital" TEXT,
    "children" TEXT,
    "adress" TEXT,
    "register" TEXT,
    "telephone" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Token.emailToken_unique" ON "Token"("emailToken");

-- CreateIndex
CREATE UNIQUE INDEX "DianonPerson.email_unique" ON "DianonPerson"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo.passport_unique" ON "PersonalInfo"("passport");

-- AddForeignKey
ALTER TABLE "Token" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD FOREIGN KEY ("personID") REFERENCES "DianonPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistinctiveFeatures" ADD FOREIGN KEY ("personId") REFERENCES "DianonPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD FOREIGN KEY ("personId") REFERENCES "DianonPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
