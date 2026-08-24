import {endpointSymbol} from 'vite-plugin-comlink/symbol'

export const terminateWorker = worker => {
  worker[endpointSymbol].terminate()
}
