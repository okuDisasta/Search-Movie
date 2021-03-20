import eel
import os
import pickle
import subprocess
import requests



eel.init('web')

@eel.expose
def openDir(path):
    pathEdit = f'explorer "{path}"'
    try:
        subprocess.Popen(pathEdit)
    except Exception as e:
        print(e)


@eel.expose
def scan():
    print("scanning")
    root_path = os.getcwd()
    #root_path = "Z:\Film Bioskop & Film Seri\_Film Terbaru_"
    try:
        file_index = [(root, files) for root, dirs, files in os.walk(root_path) if files]
        return file_index
    except Exception as e: 
        return e
        

@eel.expose
def telegram_bot_sendtext(bot_message):
    print(bot_message)
    bot_token = '1613717816:AAGCpTAekNIXN2jp19S1plPf0Rvc0Fgej3U'
    bot_chatID = '516837358'
    send_text = 'https://api.telegram.org/bot' + bot_token + '/sendMessage?chat_id=' + bot_chatID + '&parse_mode=Markdown&text=' + bot_message

    response = requests.get(send_text)

    #print(response.json())

    
    
@eel.expose
def recommendation(file_index):
    results = []
    
    for path, files in file_index:
        for file in files:
            if("comedy" in file.lower() or
               "action" in file.lower()):
                result = path + "/" + file
                results.append(result)
            else:
                continue
    
    return results
    

@eel.expose
def search(values, file_index):
    results = []
    matches = 0
    records = 0
    

    print("outside if statement")
    results.clear()
    matches = 0
    records = 0
    term = values
    
    print(term)

    if(term != ""):
        print("running")
        for path, files in file_index:
            for file in files:
                records += 1
                if(term.lower() in file.lower() or
                   file.lower().startswith(term.lower())):
                    if(file.lower().endswith(".mp4") or file.lower().endswith(".mkv")):
                        result = path + "/" + file
                        #result2 = path + "/" + file
                        results.append(result)
                        matches += 1
                else:
                    continue
        
    return results, matches
        
@eel.expose
def openFile(file):
    try:
        os.startfile(file)
        print("open")
        return file
    except Exception as e: 
        print("error")
        return file


eel.start('index.html', mode='chrome', chromeFlags=['--start-fullscreen'])

'''
values["CONTAINS"] and 
values["STARTSWITH"] and 
values["ENDSWITH"] and 
'''