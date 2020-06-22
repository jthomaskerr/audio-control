
const peek = (arr) => arr[arr.length - 1]
const filterObj = (obj, predicate) => Object.fromEntries(
    Object.entries(obj).filter(predicate)
)

export default function(COMMANDS, OPTIONS = {}) {
    OPTIONS = {...OPTIONS,
        help: {
        exec: usage,
            description: `Display this message`,
            global: true
    }}
    
    // remove node and program name
    const startIndex = process.argv[0].indexOf('node') === -1 ? 1 : 2
    const globalOptions = filterObj(OPTIONS, ([prop, data]) => data.global)
    
    const parseArg = (arg) => OPTIONS[arg].hasValue ? args.shift() : true

    function usage(exitCode = 1) {
        const formatCommandCli = ([cmd, data]) =>
            `${cmd}${data.options && data.options.length 
                ? ' ' + data.options.map(o => `[${formatOptionCli(o)}]`).join(' ') 
                : ''}`
    
        const formatOptionCli = (name) =>
            `--${name}|-${name[0]}${OPTIONS[name].hasValue 
                ? ` <${name.toUpperCase()}>` 
                : ""}`

        const formatDescription = ([name, data]) =>
            `${name.padEnd(30)} ${data.description || ""} ${data.default ? 
                `[DEFAULT: ${data.default}]` 
                : ''}`

        const executable = process.argv.slice(0, startIndex).join(' ')
        const cli = Object.entries(COMMANDS)
            .map(formatCommandCli).join('|')
        const globals = Object.keys(globalOptions)
            .map(formatOptionCli).join(' ')
        const commands = '    ' + Object.entries(COMMANDS)
            .map(formatDescription).join("\n    ")
        const options = '    ' + Object.entries(OPTIONS)
            .map( ([name, data]) => [formatOptionCli(name), data])
            .map(formatDescription)
            .join("\n    ")

        console.error(
            `USAGE:  ${executable} ${globals} <${cli}>\n\nCOMMANDS:\n${commands}\n\nOPTIONS:\n${options}`
        )
        process.exit(exitCode)
    }

    function getOption(arg) {
        if (arg.indexOf('--') === 0) {
            const name = arg.substr(2)
            return name
        } else if (arg.indexOf('-') === 0) {
            return Object.keys(OPTIONS).find(name => arg === `-${name[0]}`)
        } else {
            usage()
        }
    }
    
    const executions = []
    let globalArgs = {}
    const args = process.argv.slice(startIndex)

    while (args.length) {
        let arg = args.shift();
        if (globalOptions[arg]) {
            if (globalOptions[arg].exec) {
                executions.push({_exec: OPTIONS[arg].exec})
            } else {
                globalArgs[arg] = parseArg(arg)
            }
        } else if (COMMANDS[arg]) {
            executions.push({_exec: COMMANDS[arg].exec})
        } else if (arg = getOption(arg)) {
            peek(executions)[arg] = parseArg(arg)
        } else {
            usage()
        }
    }

    if (executions.length === 0) usage()
    for (const execution of executions) {
        execution._exec({...globalArgs, ...execution})
    }
}