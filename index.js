import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import path from 'node:path'

const mikserPlugin = ({ outputFolder = 'out', runtimeFolder = 'runtime' } = {}) => {
    const adapter = new JSONFileSync(path.join(runtimeFolder, 'database.json'))
    const database = new LowSync(adapter)
    database.read()
    database.data ||= { results: [] }

    const input = {}

    database.data.results
    .filter(entity => entity.destination && entity.destination.indexOf('.html') > -1)
    .forEach(entity => {
        input[entity.destination.substring(1)] = entity.destination
    })

    return {
        name: 'mikser',
        config: () => ({
            root: outputFolder,
            appType: 'mpa',
            clearScreen: false,
            server: {
                host: true
            },
            build: {
                outDir: '../dist',
                assetsDir: 'bundle',
                emptyOutDir: true,
                copyPublicDir: false,
                rollupOptions: {
                    input
                }
            }
        }),
    }
}
export default mikserPlugin