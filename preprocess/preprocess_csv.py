import pandas as pd
import numpy as np

def proc(fname):
    f = f"../db/csv/{fname}.csv"
    fout = f"../db/csv_new/{fname}_processed.csv"

    df = pd.read_csv(f)
    df["rank"] = df.groupby(["game", "groups"])['point'].rank('dense', ascending=False)
    df["cumsum"] = df.groupby(["name"])["point"].cumsum()

    df.to_csv(fout)

files = [
    "data2016",
    "data2017",
    "data2018",
    "data2019",
    "data2020",
    "data2021",
    "data202205"
]
for fname in files:
    proc(fname)