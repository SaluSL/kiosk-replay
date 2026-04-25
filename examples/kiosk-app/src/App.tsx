import { Button } from "@/components/ui/button"
import { createReplaySDK } from "kiosk-replay-js-sdk"
import { useEffect } from "react"

export function App() {
  const replaySDK = createReplaySDK({
    consoleUrl: "http://localhost:3000",
    deviceAlias: "ESTKO_ATRIUM_1",
  })

  useEffect(() => {
    replaySDK.start()
  }, [])
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button
            className="mt-2"
            onClick={() =>
              replaySDK.addCustomEvent("button_click", { button: "Button" })
            }
          >
            Button
          </Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}

export default App
