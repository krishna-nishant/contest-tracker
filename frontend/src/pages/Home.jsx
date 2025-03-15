import ContestList from "../components/ContestList"

function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Coding Contest Tracker</h1>
        <p className="text-muted-foreground md:text-lg">
          Stay updated with upcoming and past coding contests from popular platforms
        </p>
      </div>
      <ContestList />
    </div>
  )
}

export default Home

