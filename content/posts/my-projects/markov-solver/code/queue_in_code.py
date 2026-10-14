from markov_solver.model.markov_chain import MarkovChain
from markov_solver.model.markov_link import MarkovLink
from markov_solver.results.report import SimpleReport as Report

max_jobs = 3

chain = MarkovChain()
chain.add_symbols(arrival=1.5, service=2.0)

states = [chain.add_state(str(jobs)) for jobs in range(max_jobs + 1)]
for jobs in range(max_jobs):
    chain.add_link(MarkovLink(states[jobs], states[jobs + 1], "arrival"))
    chain.add_link(MarkovLink(states[jobs + 1], states[jobs], f"{jobs + 1}*service"))

report = Report("MARKOV CHAIN SOLUTION")
for state, probability in sorted(chain.solve().items()):
    report.add("states probability", state, probability)

print(report)
