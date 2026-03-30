import PrimaryInput from "@/components/shared/PrimaryInput";

export default function Step1PhoneInput({
  phone,
  setPhone,
  onSubmit,
  loading,
  error,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e); // Pass the event to the parent's handler
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300!">
          Phone Number
        </label>
        <PrimaryInput
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
          placeholder="+201234567890"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 dark:bg-[#363636] dark:hover:bg-[#363636]"
      >
        {loading ? "Sending..." : "Send Code"}
      </button>
    </form>
  );
}
