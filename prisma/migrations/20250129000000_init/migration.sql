-- CreateTable
CREATE TABLE "spin_results" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "spin_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spin_results_pkey" PRIMARY KEY ("id")
);
