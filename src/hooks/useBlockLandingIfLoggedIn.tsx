export const useBlockLandingIfLoggedIn = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const isOnLanding = window.location.pathname === "/"

    if (isOnLanding && !loading && user?.emailVerified) {
      toast((t) => (
        <div className="text-sm text-center">
          <p className="mb-2 font-semibold text-red-600">
            Kamu sudah login. Dialihkan ke Dashboard.
          </p>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              navigate("/dashboard")
            }}
            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            OK
          </button>
        </div>
      ), {
        duration: 8000,
        id: "block-landing-warning",
      })
    }
  }, [user, loading, navigate])
}
