import pandas as pd
import numpy as np

def proc(fname):
    f = f"../db/csv/{fname}.csv"
    fout = f"../db/csv_new/{fname}_processed.csv"

    df = pd.read_csv(f)
    df["rank"] = df.groupby(["game", "groups"])['point'].rank('dense', ascending=False)
    df["cumsum"] = df.groupby(["name"])["point"].cumsum()

    df.to_csv(fout)

def point_sum(year):
    points = {}
    with open(f"../db/csv/data{year}.csv", encoding="utf8") as f:
        next(f)
        for line in f:
            line_split = line.split(",")
            status = line_split[3]
            name = line_split[4]
            point = float(line_split[5])

            if status != "F":
                if name in points:
                    points[name] += point
                else:
                    points[name] = point
    # print(points)
    return points



years = [
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "202205"
]

point_all = {}
cols = ["year", "浅野","近藤","長屋","諏訪","枝松","落合","土橋","中山","菊地","仲"]
df_point = pd.DataFrame(columns=cols)
for year in years:
    point_of_year = point_sum(year)
    point_of_year["year"] = year 
    df_point = df_point.append(point_of_year, ignore_index=True)
    for name in point_of_year:
        if name in point_all:
            point_all[name] += point_of_year[name]
        else:
            point_all[name] = point_of_year[name]

df_point = df_point.set_index("year")
df_point.loc['Total'] = df_point.sum(numeric_only=True)
# df_point.loc['Total'] = "Total"
print(df_point)
df_point.to_html("point_of_year.html")
