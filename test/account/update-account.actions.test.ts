import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentUserMock,
  headersMock,
  saveUserAvatarMock,
  deleteUserAvatarMock,
  updateUserMock,
} = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  headersMock: vi.fn(),
  saveUserAvatarMock: vi.fn(),
  deleteUserAvatarMock: vi.fn(),
  updateUserMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/shared/lib/auth/get-current-user", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("@/features/account/server/profile-image", () => ({
  saveUserAvatar: saveUserAvatarMock,
  deleteUserAvatar: deleteUserAvatarMock,
  shouldSaveAvatar: (file: File | null) => Boolean(file && file.size > 0),
}));

vi.mock("@/shared/lib/auth/auth-config", () => ({
  auth: {
    api: {
      updateUser: updateUserMock,
    },
  },
}));

const { updateAccountAction } =
  await import("@/features/account/actions/update-account.actions");

describe("updateAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      role: "user",
    });
    headersMock.mockResolvedValue(new Headers({ cookie: "session=1" }));
    saveUserAvatarMock.mockResolvedValue("/api/account/avatar/user_1?v=123");
  });

  it("updates the user profile and avatar", async () => {
    const formData = new FormData();
    formData.set("name", "Jane Doe");
    formData.set(
      "avatar",
      new File(["avatar"], "avatar.png", { type: "image/png" }),
    );

    const result = await updateAccountAction({}, formData);

    expect(saveUserAvatarMock).toHaveBeenCalledWith({
      userId: "user_1",
      file: expect.any(File),
    });
    expect(updateUserMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        name: "Jane Doe",
        image: "/api/account/avatar/user_1?v=123",
      },
    });
    expect(result).toEqual({
      success: "Account updated successfully.",
      values: {
        name: "Jane Doe",
      },
    });
  });

  it("removes the avatar when removeAvatar is set", async () => {
    const formData = new FormData();
    formData.set("name", "Jane Doe");
    formData.set("removeAvatar", "true");

    const result = await updateAccountAction({}, formData);

    expect(deleteUserAvatarMock).toHaveBeenCalledWith("user_1");
    expect(saveUserAvatarMock).not.toHaveBeenCalled();
    expect(updateUserMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        name: "Jane Doe",
        image: null,
      },
    });
    expect(result).toEqual({
      success: "Account updated successfully.",
      values: {
        name: "Jane Doe",
      },
    });
  });
});
