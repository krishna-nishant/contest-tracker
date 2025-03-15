import SubmitSolutionForm from "../components/SubmitSolutionForm"

function SubmitSolution() {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Submit Solution</h1>
        <p className="text-muted-foreground">Share your YouTube solution for a past contest</p>
      </div>
      <SubmitSolutionForm />
    </div>
  )
}

export default SubmitSolution

