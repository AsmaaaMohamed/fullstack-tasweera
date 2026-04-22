import PrimaryInput from "@/components/shared/PrimaryInput";

export default function Step3NewPassword({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  loading,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-gray-300!">
        Set New Password
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300!">
          New Password
        </label>
        <PrimaryInput
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full"
          required
          minLength={8}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300!">
          Confirm Password
        </label>
        <PrimaryInput
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mt-4"
          required
          minLength={8}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 mt-4 dark:bg-[#363636] dark:hover:bg-[#363636]"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
