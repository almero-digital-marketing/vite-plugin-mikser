import path from 'node:path'
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const mikserPlugin = ({ outputFolder, distFolder, buildFolder, runtimeFolder } = {}) => {
    return {
        name: 'mikser',
        config: (config, { command, mode }) => {
            const root = command == 'build' ? buildFolder : process.cwd()
            const publicDir = command == 'serve' ? path.join(outputFolder, 'public') : 'public'

            Object.assign(config, {
                root,
                appType: 'mpa',
                publicDir,
            })

            const adapter = new JSONFileSync(path.join(runtimeFolder, `database.${mode}.json`))
            const database = new LowSync(adapter)
            database.read()
            database.data ||= { results: [] }

            const input = {}
            database.data.results
            .filter(entity => entity.destination && entity.destination.indexOf('.html') > -1)
            .forEach(entity => {
                input[entity.destination.substring(1)] = entity.destination
            })

            config.build ||= {}
            Object.assign(config.build, {
                outDir: distFolder,
                assetsDir: 'bundle',
                emptyOutDir: true,
                copyPublicDir: true,
                sourcemap: mode == 'development',
            })

            config.build.rollupOptions ||= {}
            Object.assign(config.build.rollupOptions, {
                input
            })
        },
    }
}
export default mikserPlugin