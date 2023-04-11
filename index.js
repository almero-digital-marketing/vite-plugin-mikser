import path from 'node:path'
import { readFileSync } from 'node:fs'

const mikserPlugin = ({ outputFolder, distFolder, buildFolder, runtimeFolder, buildMode } = {}) => {
    return {
        name: 'mikser',
        config: (config, { command, mode }) => {
            Object.assign(config, {
                root: command == 'build' ? buildFolder : config.root,
                appType: command == 'build' ? 'mpa' : config.appType,
                publicDir: command == 'serve' ? path.join(outputFolder, 'public') : config.publicDir,
            })

            if (command == 'build') {
                const renderOutput = path.join(runtimeFolder, `render-details.json`)
                const results = JSON.parse(readFileSync(renderOutput, 'utf8')) || []
    
                const input = {}
                results
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
            }
        },
    }
}
export default mikserPlugin