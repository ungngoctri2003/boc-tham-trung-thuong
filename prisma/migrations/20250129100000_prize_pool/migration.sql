-- CreateTable
CREATE TABLE "prize_pool" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "segment_index" INTEGER NOT NULL,
    "assigned_email" TEXT,
    "assigned_at" TIMESTAMP(3),

    CONSTRAINT "prize_pool_pkey" PRIMARY KEY ("id")
);
