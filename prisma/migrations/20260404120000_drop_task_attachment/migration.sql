-- DropTable
DROP TABLE "TaskAttachment";

-- Task uploads were the only path that created StoredFile rows; clear for a consistent empty state.
DELETE FROM "StoredFile";
