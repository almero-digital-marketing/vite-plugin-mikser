import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import path from 'node:path'

const mikserPlugin = ({ outputFolder = 'out', runtimeFolder = 'runtime' } = {}) => {
    return {
        name: 'mikser',
        config: (config, { command }) => {
            const mikserConfig = {
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
                    ssr: true,
                    rollupOptions: {
                    }
                }
            }
            
            if (command === 'build') {
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
                mikserConfig.build.rollupOptions.input = input
            }

            return mikserConfig
        },
    }
}
export default mikserPlugin