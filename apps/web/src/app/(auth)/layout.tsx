export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">OpsCore</h1>
          </div>
          <p className="text-sm text-gray-500">Operations management, simplified</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
