import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fdfbf7] px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-[#e2725b]">
          REWEAVE
        </p>

        <h1 className="mt-6 text-8xl font-bold tracking-tight text-[#4a3f35]">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-[#4a3f35]">
          Halaman ini belum ditemukan
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#81766d]">
          Sepertinya halaman yang kamu cari tidak tersedia atau sudah
          berpindah. Tenang, kamu bisa kembali dan melanjutkan harimu.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl
          bg-[#e2725b] px-6 py-3 text-sm font-semibold text-white
          transition hover:bg-[#cb604b]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}