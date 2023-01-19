import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import path from 'node:path'
import { rmSync } from 'node:fs'

const mikserPlugin = ({ outputFolder = 'out', runtimeFolder = 'runtime' } = {}) => {
    return {
        name: 'mikser',
        config: (config, { command }) => {
            Object.assign(config, {
                root: outputFolder,
                appType: 'mpa',
                clearScreen: false,
                server: {
                    host: true
                },
                build: {
                    outDir: '../dist',
                    assetsDir: 'bundle',
                    emptyOutDir: false,
                }
            })

            try {
                rmSync('dist/bundle', { recursive: true })
            } catch (err) {
                if (err.code != 'ENOENT')
                throw err
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
                config.build.rollupOptions ||= {}
                config.build.rollupOptions.input = input
            }
        },
    }
}
export default mikserPlugin