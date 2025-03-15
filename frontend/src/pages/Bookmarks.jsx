import BookmarkedContests from "../components/BookmarkedContests"

function Bookmarks() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Bookmarked Contests</h1>
        <p className="text-muted-foreground">Your saved contests for quick access</p>
      </div>
      <BookmarkedContests />
    </div>
  )
}

export default Bookmarks

