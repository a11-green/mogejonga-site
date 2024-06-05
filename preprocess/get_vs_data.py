import pandas as pd
import numpy as np
import csv 

def init_dic():
    dic = {
        "A": {"name": [], "rank": [], "point": []},
        "B": {"name": [], "rank": [], "point": []}
        }
    return dic

def get_vs_data():
    names = ["浅野","近藤","長屋","諏訪","枝松","落合","土橋","中山","菊地", "仲", "長山", "藤好"]
    years = ["2016","2017","2018","2019","2020","2021","202205","202212","2023"]
    # res1 = dict.fromkeys(names, dict.fromkeys(names, 0))
    # res2 = dict.fromkeys(names, dict.fromkeys(names, 0))

    n = len(names)
    print(n)
    res1 = np.zeros((n, n))
    res2 = np.zeros((n, n))
    tot_game = np.zeros((n, n))

    print(res1)
    for year in years:
        print(year)
        with open(f"../db/csv/data{year}_processed.csv", encoding="utf8") as f:
            data = np.array(list(csv.reader(f)))
            game = data[1:, 1]
            group = data[1:, 2]
            status = data[1:, 3]
            name = data[1:, 4]
            point = data[1:, 5]
            rank = data[1:, 6]

            counter = 0
            dic = init_dic()
            for i, gr in enumerate(group):
                if status[i] == "F":
                    break
                counter += 1
                dic[gr]["name"].append(name[i])
                dic[gr]["rank"].append(int(float(rank[i])))
                dic[gr]["point"].append(float(point[i]))
                if counter == 8:
                    
                    for i in range(4):
                        for j in range(3):
                            x = names.index(dic["A"]["name"][i])
                            y = names.index(dic["A"]["name"][i-(j+1)])
                            p = dic["A"]["point"][i]
                            r = dic["A"]["rank"][i]
                            res1[x, y] += p
                            res2[x, y] += r
                            tot_game[x, y] += 1
                            x = names.index(dic["B"]["name"][i])
                            y = names.index(dic["B"]["name"][i-(j+1)])
                            p = dic["B"]["point"][i]
                            r = dic["B"]["rank"][i]
                            res1[x, y] += p
                            res2[x, y] += r
                            tot_game[x, y] += 1
          

                    
                    if year == '2023':
                        print(game[i], dic["A"])
                        print(game[i], dic["B"])

               

                    counter = 0
                    dic = init_dic()
    print(names)
    print(res1)
    print(np.sum(res1[0, :]))
    print(np.sum(res1[:, 0]))

    
    df1 = pd.DataFrame(res1, index=names, columns=names)
    df1.to_html("vs_point.html")

    pd.options.display.float_format = '{:.2f}'.format

    print(res2)
    print(tot_game)
    
    res3 = np.divide(res2, tot_game)
    df2 = pd.DataFrame(res3, index=names, columns=names)
    df2.to_html("vs_rank.html")

    

   
          


 








            # group_a_name = []
            # group_a_rank = []
            # group_b_name = []
            # group_b_rank = []
            # next(f)
            # for line in f:
                
            #     line_split = line.split(",")
            #     game = line_split[1]
            #     group = line_split[2]
            #     status = line_split[3]
            #     name = line_split[4]
            #     point = line_split[5]
            #     rank = int(float(line_split[6]))
            #     if status != 'F':
            #         if (len(group_a_name) == 4) & (len(group_b_name) == 4):
            #             print(game, group_a_name, group_a_rank)
            #             group_a_name = []
            #             group_a_rank = []
            #             group_b_name = []
            #             group_b_rank = []
            #         else:

            #             if group == 'A':
            #                 group_a_name.append(name)
            #                 group_a_rank.append(rank)
            #             elif group == 'B':
            #                 group_b_name.append(name)
            #                 group_b_rank.append(rank)
            #             else:
            #                 pass



get_vs_data()

                #     tmp1 = line_split[1]
                #     if tmp1 != game:
                #         group_a_name = []
                #         group_a_rank = []
                #         group_b_name = []
                #         group_b_rank = []
                #         game = tmp1
                #     group = line_split[2]
                #     if group == 'A':
                #         group_a_name.append(name)
                #         group_a_rank.append(rank)
                #     elif group == 'B':
                #         group_b_name.append(name)
                #         group_b_rank.append(rank)
                #     else:
                #         pass
                # else:
                #     pass
                # if (len(group_a_name) == 4) & (len(group_b_name) == 4):
                #     for i in range(4):
                #         rank_a_i = group_a_rank[i]
                #         name_a_i = group_a_name[i]
                #         name_a_js = [group_a_name[i-1], group_a_name[i-2], group_a_name[i-3]]
                #         rank_b_i = group_b_rank[i]
                #         name_b_i = group_b_name[i]
                #         name_b_js = [group_b_name[i-1], group_b_name[i-2], group_b_name[i-3]]
                #         for name_a_j in name_a_js:
                #             print(name_a_i, name_a_j)
                #             res2[name_a_i][name_a_j] =  (res2[name_a_i][name_a_j] * res1[name_a_i][name_a_j] + rank_a_i)/(res1[name_a_i][name_a_j] + 1)
                #             res1[name_a_i][name_a_j] += 1 
                #         for name_b_j in name_b_js:
                #             res2[name_b_i][name_b_j] =  (res2[name_b_i][name_b_j] * res1[name_b_i][name_b_j] + rank_b_i)/(res1[name_b_i][name_b_j] + 1)
                #             res1[name_b_i][name_b_j] += 1 
