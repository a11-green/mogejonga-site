import pandas as pd
import numpy as np

def proc(year):
    f = f"../db/csv/data{year}.csv"
    fout = f"../db/csv/data{year}_processed.csv"

    df = pd.read_csv(f)
    df["rank"] = df.groupby(["game", "groups"])['point'].rank('dense', ascending=False)
    df["cumsum"] = df.groupby(["name"])["point"].cumsum()

    df.to_csv(fout, index = False)

def get_data(year):
    points = {}
    rank_dist = {} 
    with open(f"../db/csv/data{year}_processed.csv", encoding="utf8") as f:
        next(f)
        for line in f:
            line_split = line.split(",")
            status = line_split[3]
            name = line_split[4]
            point = float(line_split[5])
            rank = int(float(line_split[6]))

            if status != "F":
                if name in points:
                    points[name] += point
                    rank_dist[name][rank-1] += 1
                else:
                    points[name] = point
                    rank_dist[name] = [0, 0, 0, 0]
                    rank_dist[name][rank-1] += 1
    # print(points)
    print(rank_dist)
    return points, rank_dist






years = [
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "202205",
    "202212"
]

for year in years:
    proc(year)


point_all = {}
rank_dist_all = {}
rank_1st_all = {}
rank_2nd_all = {}
rank_3rd_all = {}
rank_4th_all = {}
rank_ave_all = {}
cols = ["year", "浅野","近藤","長屋","諏訪","枝松","落合","土橋","中山","菊地","仲"]
df_point = pd.DataFrame(columns=cols)
for year in years:
    point_of_year, rank_dist_of_year = get_data(year)
    point_of_year["year"] = year 
    # rank_dist_of_year["year"] = year
    df_point = df_point.append(point_of_year, ignore_index=True)
    for name in point_of_year:
        if name in point_all:
            point_all[name] += point_of_year[name]
        else:
            point_all[name] = point_of_year[name]

    for name in rank_dist_of_year:
        if name in rank_dist_all:
            rank_dist_all[name] = [x + y for x, y in zip(rank_dist_all[name], rank_dist_of_year[name])] 
        else:
            rank_dist_all[name] = [0, 0, 0, 0]
            rank_dist_all[name] = [x + y for x, y in zip(rank_dist_all[name], rank_dist_of_year[name])] 
        
for name in rank_dist_all:
    n1, n2, n3, n4 = tuple(rank_dist_all[name])
    rank_1st_all[name] = n1
    rank_2nd_all[name] = n2
    rank_3rd_all[name] = n3
    rank_4th_all[name] = n4
    rank_ave_all[name] = (1*n1+2*n2+3*n3+4*n4)/(n1+n2+n3+n4)

cols = ["浅野","近藤","長屋","諏訪","枝松","落合","土橋","中山","菊地","仲"]
df_rank = pd.DataFrame(columns=cols)
df_rank = df_rank.append(rank_1st_all, ignore_index=True)
df_rank = df_rank.append(rank_2nd_all, ignore_index=True)
df_rank = df_rank.append(rank_3rd_all, ignore_index=True)
df_rank = df_rank.append(rank_4th_all, ignore_index=True)
df_rank = df_rank.append(rank_ave_all, ignore_index=True)

df_point = df_point.set_index("year")
df_point.loc['Total'] = df_point.sum(numeric_only=True)
# df_point.loc['Total'] = "Total"
# print(df_point)
print(rank_dist_all)
print(rank_ave_all)
pd.options.display.float_format = '{:.2f}'.format
df_point.to_html("point_of_year.html")
df_rank.to_html("rank.html")

