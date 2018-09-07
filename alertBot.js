/**

 Copyright © 2014-2018 alertBot

 Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.

 */

 (function() {

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem('alertBotRoom'));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        clearInterval(alertBot.room.autodisableInterval);
        clearInterval(alertBot.room.afkInterval);
        alertBot.status = false;
    };

    // This socket server is used solely for statistical and troubleshooting purposes.
    // This server may not always be up, but will be used to get live data at any given time.

    /*
    var socket = function() {
        function loadSocket() {
            SockJS.prototype.msg = function(a) {
                this.send(JSON.stringify(a))
            };
            sock = new SockJS('https://benzi.io:4964/socket');
            sock.onopen = function() {
                console.log('Connected to socket!');
                sendToSocket();
            };
            sock.onclose = function() {
                console.log('Disconnected from socket, reconnecting every minute ..');
                var reconnect = setTimeout(function() {
                    loadSocket()
                }, 60 * 1000);
            };
            sock.onmessage = function(broadcast) {
                var rawBroadcast = broadcast.data;
                var broadcastMessage = rawBroadcast.replace(/["\\]+/g, '');
                API.chatLog(broadcastMessage);
                console.log(broadcastMessage);
            };
        }
        if (typeof SockJS == 'undefined') {
            $.getScript('https://cdn.jsdelivr.net/sockjs/1.0.3/sockjs.min.js', loadSocket);
        } else loadSocket();
    }

    var sendToSocket = function() {
        var alertBotSettings = alertBot.settings;
        var alertBotRoom = alertBot.room;
        var alertBotInfo = {
            time: Date.now(),
            version: alertBot.version
        };
        var data = {
            users: API.getUsers(),
            userinfo: API.getUser(),
            room: location.pathname,
            alertBotSettings: alertBotSettings,
            alertBotRoom: alertBotRoom,
            alertBotInfo: alertBotInfo
        };
        return sock.msg(data);
    };
    */

    var storeToStorage = function() {
        localStorage.setItem('alertBotsettings', JSON.stringify(alertBot.settings));
        localStorage.setItem('alertBotRoom', JSON.stringify(alertBot.room));
        var alertBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: alertBot.version
        };
        localStorage.setItem('alertBotStorageInfo', JSON.stringify(alertBotStorageInfo));
    };

    var subChat = function(chat, obj) {
        if (typeof chat === 'undefined') {
            API.chatLog('There is a chat text missing.');
            console.log('There is a chat text missing.');
            return '[Error] No text message found.';

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function(cb) {
        if (!cb) cb = function() {};
        $.get('https://rawgit.com/HarryMcKenzie/source/master/lang/langIndex.json', function(json) {
            var link = alertBot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[alertBot.settings.language.toLowerCase()];
                if (alertBot.settings.chatLink !== alertBot.chatLink) {
                    link = alertBot.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = alertBot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        alertBot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(alertBot.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        alertBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem('alertBotsettings'));
        if (settings !== null) {
            for (var prop in settings) {
                alertBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem('alertBotStorageInfo');
        if (info === null) API.chatLog(alertBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem('alertBotsettings'));
            var room = JSON.parse(localStorage.getItem('alertBotRoom'));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(alertBot.chat.retrievingdata);
                for (var prop in settings) {
                    alertBot.settings[prop] = settings[prop];
                }
                alertBot.room.users = room.users;
                alertBot.room.afkList = room.afkList;
                alertBot.room.historyList = room.historyList;
                alertBot.room.mutedUsers = room.mutedUsers;
                //alertBot.room.autoskip = room.autoskip;
                alertBot.room.roomstats = room.roomstats;
                alertBot.room.messages = room.messages;
                alertBot.room.queue = room.queue;
                alertBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(alertBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var info = _.find(require.s.contexts._.defined, (m) => m && m.attributes && 'hostID' in m.attributes).get('long_description');
        var ref_bot = '@alertBot=';
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(' ') < link.indexOf('\n')) ind_space = link.indexOf(' ');
            else ind_space = link.indexOf('\n');
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== 'undefined') {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        alertBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = 'Yemasthui';
    var botMaintainer = 'Benzi';
    var botCreatorIDs = [3851534, 4105209, 3941421, 37218461];

    var alertBot = {
        version: '0.0.1',
        status: false,
        name: 'alertBot',
        loggedInID: null,
        scriptLink: 'https://rawgit.com/HarryMcKenzie/source/master/alertBot.js',
        cmdLink: 'http://git.io/245Ppg',
        chatLink: 'https://rawgit.com/HarryMcKenzie/source/master/lang/en.json',
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
        botName: 'alertBot',
  			language: 'english',
  			chatLink: 'https://rawgit.com/HarryMcKenzie/source/master/lang/en.json',
  			scriptLink: 'https://rawgit.com/HarryMcKenzie/source/master/alertBot.js',
  			roomLock: false, // Requires an extension to re-load the script
  			startupCap: 200, // 1-200
  			startupVolume: 0, // 0-100
  			startupEmoji: true, // true or false
  			autowoot: false,
  			autoskip: false,
  			smartSkip: false,
  			cmdDeletion: true,
  			maximumAfk: 180,
  			afkRemoval: false,
  			maximumDc: 60,
  			bouncerPlus: false,
  			blacklistEnabled: false,
  			lockdownEnabled: false,
  			lockGuard: false,
  			maximumLocktime: 10,
  			cycleGuard: false,
  			maximumCycletime: 10,
  			voteSkip: false,
  			voteSkipLimit: 69,
  			historySkip: false,
  			timeGuard: false,
  			strictTimeGuard: true,
  			maximumSongLength: 10,
  			autodisable: false,
  			commandCooldown: 30,
  			usercommandsEnabled: false,
  			thorCommand: false,
  			thorCooldown: 500,
  			skipPosition: 0,
  			skipReasons: [
  				['theme', 'This song does not fit the room theme. '],
  				['op', 'This song is on the OP list. '],
  				['history', 'This song is in the history. '],
  				['mix', 'You played a mix, which is against the rules. '],
  				['sound', 'The song you played had bad sound quality or no sound. '],
  				['nsfw', 'The song you played was NSFW (image or sound). '],
  				['unavailable', 'The song you played was not available for some users. ']
  				['staff', 'a Staff member didn´t enjoy the song and abused their powers for everyone´s sake. ']
  			],
  			afkpositionCheck: 50,
  			afkRankCheck: 'user',
  			motdEnabled: false,
  			motdInterval: 15,
  			motd: 'Allo',
  			filterChat: false,
  			etaRestriction: true,
  			welcome: false,
  			opLink: null,
  			rulesLink: 'http://bit.ly/xqcs-alert',
  			themeLink: null,
  			fbLink: null,
  			youtubeLink: 'http://youtube.com/xqcow',
  			website: 'http://twitch.tv/xqcow',
  			intervalMessages: [],
  			messageInterval: 11,
  			songstats: false,
  			commandLiteral: '?',
  			blacklists: {
  				BANNED: 'https://rawgit.com/HarryMcKenzie/source/master/blacklists/BANNEDlist.json'
  						}
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: false,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function() {
                if (alertBot.status && alertBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            tgSkip: null,
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    alertBot.room.roulette.rouletteStatus = true;
                    alertBot.room.roulette.countdown = setTimeout(function() {
                        alertBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(alertBot.chat.isopen);
                },
                endRoulette: function() {
                    alertBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * alertBot.room.roulette.participants.length);
                    var winner = alertBot.room.roulette.participants[ind];
                    alertBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = alertBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(alertBot.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        alertBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: []
        },
        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {

          //START CUSTOM USERUTILITIES FUNCTIONS

          //Find user ID without them necessarily being in the room still
          getID: function(name) {
                      var id;
                      var users = alertBot.room.users;
                      var len = users.length;
                      for (var i = 0; i < len; ++i) {
                          if (users[i].username == name) {
                              var id = users[i].id;
                          }
                      }

                  if (isNaN(id)) return false;
                  else return id;
              },

          //END CUSTOM FUNCTIONS

            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = alertBot.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === id) {
                        return alertBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    var match = alertBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return alertBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = alertBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) {
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                if (isNaN(u.gRole)) return 9999;
                if (botCreatorIDs.indexOf(u.id) > -1) return 9999;
                if (isNaN(u.gRole)) return 9999;
                if (u.gRole < 3000) return u.role;
                else {
                    switch (u.gRole) {
                        case 3000:
                            return (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        case 5000:
                            return (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = alertBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < alertBot.room.queue.id.length; i++) {
                            if (alertBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            alertBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(alertBot.chat.alreadyadding, {
                                position: alertBot.room.queue.position[alreadyQueued]
                            }));
                        }
                        alertBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            alertBot.room.queue.id.unshift(id);
                            alertBot.room.queue.position.unshift(pos);
                        } else {
                            alertBot.room.queue.id.push(id);
                            alertBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(alertBot.chat.adding, {
                            name: name,
                            position: alertBot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = alertBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return alertBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(alertBot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return alertBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (alertBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = alertBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(alertBot.chat.toolongago, {
                    name: alertBot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = alertBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = alertBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(alertBot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(alertBot.chat.valid, {
                    name: alertBot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                alertBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case 'admin':
                        rankInt = 10;
                        break;
                    case 'ambassador':
                        rankInt = 7;
                        break;
                    case 'host':
                        rankInt = 5;
                        break;
                    case 'cohost':
                        rankInt = 4;
                        break;
                    case 'manager':
                        rankInt = 3;
                        break;
                    case 'bouncer':
                        rankInt = 2;
                        break;
                    case 'residentdj':
                        rankInt = 1;
                        break;
                    case 'user':
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!alertBot.roomUtilities.booth.locked);
                    alertBot.roomUtilities.booth.locked = false;
                    if (alertBot.settings.lockGuard) {
                        alertBot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(alertBot.roomUtilities.booth.locked);
                        }, alertBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(alertBot.roomUtilities.booth.locked);
                    clearTimeout(alertBot.roomUtilities.booth.lockTimer);
                      }
                  },

            afkCheck: function() {
                if (!alertBot.status || !alertBot.settings.afkRemoval) return void(0);
                var rank = alertBot.roomUtilities.rankToNumber(alertBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, alertBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = alertBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = alertBot.userUtilities.getUser(user);
                            if (rank !== null && alertBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = alertBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = alertBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                          /*
                                //Prevent users that were in the room but not in queue to be affected by afk removal

                                if (inactivity > alertBot.settings.maximumAfk * 60 * 1500) {

                                    alertBot.userUtilities.setLastActivity(user);

                                }

                          */
                                if (inactivity > alertBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(alertBot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(alertBot.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            alertBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(alertBot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: alertBot.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                alertBot.room.queueable = false;

                if (waitlistlength == 50) {
                    alertBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 1);
                    alertBot.room.skippable = false;
                    setTimeout(function() {
                        alertBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        alertBot.userUtilities.moveUser(id, alertBot.settings.skipPosition, false);
                        alertBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                alertBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(alertBot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (alertBot.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            alertBot.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, alertBot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (alertBot.settings.motdEnabled) interval = alertBot.settings.motdInterval;
                else interval = alertBot.settings.messageInterval;
                if ((alertBot.room.roomstats.songCount % interval) === 0 && alertBot.status) {
                    var msg;
                    if (alertBot.settings.motdEnabled) {
                        msg = alertBot.settings.motd;
                    } else {
                        if (alertBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = alertBot.room.roomstats.songCount % alertBot.settings.intervalMessages.length;
                        msg = alertBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in alertBot.settings.blacklists) {
                    alertBot.room.blacklists[bl] = [];
                    if (typeof alertBot.settings.blacklists[bl] === 'function') {
                        alertBot.room.blacklists[bl] = alertBot.settings.blacklists();
                    } else if (typeof alertBot.settings.blacklists[bl] === 'string') {
                        if (alertBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(alertBot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    alertBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(alertBot.room.newBlacklisted);
                } else {
                    console.log(alertBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < alertBot.room.newBlacklisted.length; i++) {
                    var track = alertBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
                }
              },
            eventChat: function(chat) {
                chat.message = linkFixer(chat.message);
                chat.message = decodeEntities(chat.message);
                chat.message = chat.message.trim();

                alertBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === chat.uid) {
                        alertBot.userUtilities.setLastActivity(alertBot.room.users[i]);
                        if (alertBot.room.users[i].username !== chat.un) {
                            alertBot.room.users[i].username = chat.un;
                        }
                    }
                }
                if (alertBot.chatUtilities.chatFilter(chat)) return void(0);
                if (!alertBot.chatUtilities.commandCheck(chat))
                    alertBot.chatUtilities.action(chat);
            },
            eventUserjoin: function(user) {
                var known = false;
                var index = null;
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === user.id) {
                        known = true;
                        index = i;
                    }
                }
                var greet = true;
                var welcomeback = null;
                if (known) {
                    alertBot.room.users[index].inRoom = true;
                    var u = alertBot.userUtilities.lookupUser(user.id);
                    var jt = u.jointime;
                    var t = Date.now() - jt;
                    if (t < 10 * 1000) greet = false;
                    else welcomeback = true;
                } else {
                    alertBot.room.users.push(new alertBot.User(user.id, user.username));
                    welcomeback = false;
                }
                for (var j = 0; j < alertBot.room.users.length; j++) {
                    if (alertBot.userUtilities.getUser(alertBot.room.users[j]).id === user.id) {
                        alertBot.userUtilities.setLastActivity(alertBot.room.users[j]);
                        alertBot.room.users[j].jointime = Date.now();
                    }

                }

                if (botCreatorIDs.indexOf(user.id) > -1) {
                  console.log(true);
                    API.sendChat('@'+user.username+' '+':sparkles: :bow: :sparkles:');
                } else if (alertBot.settings.welcome && greet) {
                  console.log(false);
                  console.log(botCreatorIDs);
                    welcomeback ?
                        setTimeout(function(user) {
                            API.sendChat(subChat(alertBot.chat.welcomeback, {
                                name: user.username
                            }));
                        }, 1 * 1000, user) :
                        setTimeout(function(user) {
                            API.sendChat(subChat(alertBot.chat.welcome, {
                                name: user.username
                            }));
                        }, 1 * 1000, user);
                }
            },
            eventUserleave: function(user) {
                var lastDJ = API.getHistory()[0].user.id;
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === user.id) {
                        alertBot.userUtilities.updateDC(alertBot.room.users[i]);
                        alertBot.room.users[i].inRoom = false;
                        if (lastDJ == user.id) {
                            var user = alertBot.userUtilities.lookupUser(alertBot.room.users[i].id);
                            alertBot.userUtilities.updatePosition(user, 0);
                            user.lastDC.time = null;
                            user.lastDC.position = user.lastKnownPosition;
                        }
                    }
                }
            },
            eventVoteupdate: function(obj) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === obj.user.id) {
                        if (obj.vote === 1) {
                            alertBot.room.users[i].votes.woot++;
                        } else {
                            alertBot.room.users[i].votes.meh++;
                        }
                    }
                }

                var mehs = API.getScore().negative;
                var woots = API.getScore().positive;
                var dj = API.getDJ();
                var timeLeft = API.getTimeRemaining();
                var timeElapsed = API.getTimeElapsed();

                if (alertBot.settings.voteSkip) {
                    if ((mehs - woots) >= (alertBot.settings.voteSkipLimit)) {
                        API.sendChat(subChat(alertBot.chat.voteskipexceededlimit, {
                            name: dj.username,
                            limit: alertBot.settings.voteSkipLimit
                        }));
                        if (alertBot.settings.smartSkip && timeLeft > timeElapsed) {
                            alertBot.roomUtilities.smartSkip();
                        } else {
                            API.moderateForceSkip();
                        }
                    }
                }

            },
            eventCurateupdate: function(obj) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === obj.user.id) {
                        alertBot.room.users[i].votes.curate++;
                    }
                }
            },
            eventDjadvance: function(obj) {
                if (!obj.dj) return;
                API.chatLog('next dj');

                var queue = API.getWaitList();

                var queuelength = queue.length;
                var newusers = 0;
                API.chatLog('The queue is ' + queuelength + ' people long.');

                for (var i = 0; i < 5; i++) {

                    var quserid = queue.id[i];
                    var qusername = alertBot.userUtilities.lookupUserName(quserid);
                    API.chatLog('at position' + i + ' is ' + qusername + '.');
                  }

                    var blacklistSkip = setTimeout(function() {
                        var mid = obj.media.format + ':' + obj.media.cid;
                        for (var bl in alertBot.room.blacklists) {
                            if (alertBot.settings.blacklistEnabled) {
                                if (alertBot.room.blacklists[bl].indexOf(mid) > -1) {
                                    API.sendChat(subChat(alertBot.chat.isblacklisted, {
                                        blacklist: bl
                                    }));
                                    if (alertBot.settings.smartSkip) {
                                        return alertBot.roomUtilities.smartSkip();
                                    } else {
                                        return API.moderateForceSkip();
                                    }
                                }
                            }
                        }
                    }, 1);

                    var user = alertBot.userUtilities.lookupUser(obj.dj.id)
                    for (var i = 0; i < alertBot.room.users.length; i++) {
                        if (alertBot.room.users[i].id === user.id) {
                            alertBot.room.users[i].lastDC = {
                                time: null,
                                position: null,
                                songCount: 0
                            };
                        }
                    }

                    var lastplay = obj.lastPlay;
                    if (typeof lastplay === 'undefined') return;
                    if (alertBot.settings.songstats) {
                        if (typeof alertBot.chat.songstatistics === 'undefined') {
                            API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.')
                        } else {
                            API.sendChat(subChat(alertBot.chat.songstatistics, {
                                artist: lastplay.media.author,
                                title: lastplay.media.title,
                                woots: lastplay.score.positive,
                                grabs: lastplay.score.grabs,
                                mehs: lastplay.score.negative
                            }))
                        }
                    }
                    alertBot.room.roomstats.totalWoots += lastplay.score.positive;
                    alertBot.room.roomstats.totalMehs += lastplay.score.negative;
                    alertBot.room.roomstats.totalCurates += lastplay.score.grabs;
                    alertBot.room.roomstats.songCount++;
                    alertBot.roomUtilities.intervalMessage();
                    alertBot.room.currentDJID = obj.dj.id;


                    var newMedia = obj.media;
                    clearTimeout(alertBot.room.tgSkip);
                    var timeLimitSkip = setTimeout(function() {
                        if (alertBot.settings.timeGuard && newMedia.duration > alertBot.settings.maximumSongLength * 60 && !alertBot.room.roomevent) {
                            if (typeof alertBot.settings.strictTimeGuard === 'undefined' || alertBot.settings.strictTimeGuard) {
                                var name = obj.dj.username;
                                API.sendChat(subChat(alertBot.chat.timelimit, {
                                    name: name,
                                    maxlength: alertBot.settings.maximumSongLength
                                }));
                                if (alertBot.settings.smartSkip) {
                                    return alertBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            } else {
                                alertBot.room.tgSkip = setTimeout(function() {
                                    if (alertBot.settings.timeGuard) return API.moderateForceSkip();
                                    return;
                                }, alertBot.settings.maximumSongLength*60*1000);
                            }
                        }
                    }, 2000);
                    var format = obj.media.format;
                    var cid = obj.media.cid;
                    var naSkip = setTimeout(function() {
                        if (format == 1) {
                            $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function(track) {
                                if (typeof(track.items[0]) === 'undefined') {
                                    var name = obj.dj.username;
                                    API.sendChat(subChat(alertBot.chat.notavailable, {
                                        name: name
                                    }));
                                    if (alertBot.settings.smartSkip) {
                                        return alertBot.roomUtilities.smartSkip();
                                    } else {
                                        return API.moderateForceSkip();
                                    }
                                }
                            });
                        } else {
                            var checkSong = SC.get('/tracks/' + cid, function(track) {
                                if (typeof track.title === 'undefined') {
                                    var name = obj.dj.username;
                                    API.sendChat(subChat(alertBot.chat.notavailable, {
                                        name: name
                                    }));
                                    if (alertBot.settings.smartSkip) {
                                        return alertBot.roomUtilities.smartSkip();
                                    } else {
                                        return API.moderateForceSkip();
                                    }
                                }
                            });
                        }
                    }, 1);
                    clearTimeout(historySkip);
                    if (alertBot.settings.historySkip) {
                        var alreadyPlayed = false;
                        var apihistory = API.getHistory();
                        var name = obj.dj.username;
                        var historySkip = setTimeout(function() {
                            for (var i = 0; i < apihistory.length; i++) {
                                if (apihistory[i].media.cid === obj.media.cid) {
                                    alertBot.room.historyList[i].push(+new Date());
                                    alreadyPlayed = true;
                                    API.sendChat(subChat(alertBot.chat.songknown, {
                                        name: name
                                    }));
                                    if (alertBot.settings.smartSkip) {
                                        return alertBot.roomUtilities.smartSkip();
                                    } else {
                                        return API.moderateForceSkip();
                                    }
                                }
                            }
                            if (!alreadyPlayed) {
                                alertBot.room.historyList.push([obj.media.cid, +new Date()]);
                            }
                        }, 1);
                    }
                    if (user.ownSong) {
                        API.sendChat(subChat(alertBot.chat.permissionownsong, {
                            name: user.username
                        }));
                        user.ownSong = false;
                    }
                    clearTimeout(alertBot.room.autoskipTimer);
                    if (alertBot.settings.autoskip) {
                        var remaining = obj.media.duration * 1000;
                        var startcid = API.getMedia().cid;
                        alertBot.room.autoskipTimer = setTimeout(function() {
                            if (!API.getMedia()) return;

                            var endcid = API.getMedia().cid;
                            if (startcid === endcid) {
                                //API.sendChat('Song stuck, skipping...');
                                API.moderateForceSkip();
                            }
                        }, remaining + 5000);
                    }
                    storeToStorage();
                    //sendToSocket();
                },

//END DJADVANCE FUNCTION




            eventWaitlistupdate: function(users) {
                if (users.length < 50) {
                    if (alertBot.room.queue.id.length > 0 && alertBot.room.queueable) {
                        alertBot.room.queueable = false;
                        setTimeout(function() {
                            alertBot.room.queueable = true;
                        }, 500);
                        alertBot.room.queueing++;
                        var id, pos;
                        setTimeout(
                            function() {
                                id = alertBot.room.queue.id.splice(0, 1)[0];
                                pos = alertBot.room.queue.position.splice(0, 1)[0];
                                API.moderateAddDJ(id, pos);
                                setTimeout(
                                    function(id, pos) {
                                        API.moderateMoveDJ(id, pos);
                                        alertBot.room.queueing--;
                                        if (alertBot.room.queue.id.length === 0) setTimeout(function() {
                                            alertBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1000, id, pos);
                            }, 1000 + alertBot.room.queueing * 2500);
                    }
                }
                for (var i = 0; i < users.length; i++) {
                    var user = alertBot.userUtilities.lookupUser(users[i].id);
                    alertBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
                }
            },

            chatcleaner: function(chat) {
                if (!alertBot.settings.filterChat) return false;
                if (alertBot.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
                var msg = chat.message;
                var containsLetters = false;
                for (var i = 0; i < msg.length; i++) {
                    ch = msg.charAt(i);
                    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
                }
                if (msg === '') {
                    return true;
                }
                if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
                msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
                var capitals = 0;
                var ch;
                for (var i = 0; i < msg.length; i++) {
                    ch = msg.charAt(i);
                    if (ch >= 'A' && ch <= 'Z') capitals++;
                }
                if (capitals >= 40) {
                    API.sendChat(subChat(alertBot.chat.caps, {
                        name: chat.un
                    }));
                    return true;
                }
                msg = msg.toLowerCase();
                if (msg === 'skip') {
                    API.sendChat(subChat(alertBot.chat.askskip, {
                        name: chat.un
                    }));
                    return true;
                }
                for (var j = 0; j < alertBot.chatUtilities.spam.length; j++) {
                    if (msg === alertBot.chatUtilities.spam[j]) {
                        API.sendChat(subChat(alertBot.chat.spam, {
                            name: chat.un
                        }));
                        return true;
                    }
                }
                return false;
            },

            chatUtilities: {
              chatFilter: function(chat) {
                  var msg = chat.message;
                  var perm = alertBot.userUtilities.getPermission(chat.uid);
                  var user = alertBot.userUtilities.lookupUser(chat.uid);
                  var isMuted = false;
                  for (var i = 0; i < alertBot.room.mutedUsers.length; i++) {
                      if (alertBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                  }
                  if (isMuted) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }
                  if (alertBot.settings.lockdownEnabled) {
                      if (perm === API.ROLE.NONE) {
                          API.moderateDeleteChat(chat.cid);
                          return true;
                      }
                  }
                  if (alertBot.chatcleaner(chat)) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }
                  if (alertBot.settings.cmdDeletion && msg.startsWith(alertBot.settings.commandLiteral)) {
                      API.moderateDeleteChat(chat.cid);
                  }
                  /**
                   var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                   if (plugRoomLinkPatt.exec(msg)) {
                      if (perm === API.ROLE.NONE) {
                          API.sendChat(subChat(alertBot.chat.roomadvertising, {name: chat.un}));
                          API.moderateDeleteChat(chat.cid);
                          return true;
                      }
                  }
                   **/
                  if (msg.indexOf('http://adf.ly/') > -1) {
                      API.moderateDeleteChat(chat.cid);
                      API.sendChat(subChat(alertBot.chat.adfly, {
                          name: chat.un
                      }));
                      return true;
                  }
                  if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }

                  var rlJoinChat = alertBot.chat.roulettejoin;
                  var rlLeaveChat = alertBot.chat.rouletteleave;

                  var joinedroulette = rlJoinChat.split('%%NAME%%');
                  if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                  else joinedroulette = joinedroulette[0];

                  var leftroulette = rlLeaveChat.split('%%NAME%%');
                  if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                  else leftroulette = leftroulette[0];

                  if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === alertBot.loggedInID) {
                      setTimeout(function(id) {
                          API.moderateDeleteChat(id);
                      }, 5 * 1000, chat.cid);
                      return true;
                  }
                  return false;
              },
                commandCheck: function(chat) {
                    var cmd;
                    if (chat.message.charAt(0) === alertBot.settings.commandLiteral) {
                        var space = chat.message.indexOf(' ');
                        if (space === -1) {
                            cmd = chat.message;
                        } else cmd = chat.message.substring(0, space);
                    } else return false;
                    var userPerm = alertBot.userUtilities.getPermission(chat.uid);
                    //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                    if (chat.message !== alertBot.settings.commandLiteral + 'join' && chat.message !== alertBot.settings.commandLiteral + 'leave') {
                        if (userPerm === API.ROLE.NONE && !alertBot.room.usercommand) return void(0);
                        if (!alertBot.room.allcommand) return void(0);
                    }
                    if (chat.message === alertBot.settings.commandLiteral + 'eta' && alertBot.settings.etaRestriction) {
                        if (userPerm < API.ROLE.BOUNCER) {
                            var u = alertBot.userUtilities.lookupUser(chat.uid);
                            if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                                API.moderateDeleteChat(chat.cid);
                                return void(0);
                            } else u.lastEta = Date.now();
                        }
                    }
                    var executed = false;

                    for (var comm in alertBot.commands) {
                        var cmdCall = alertBot.commands[comm].command;
                        if (!Array.isArray(cmdCall)) {
                            cmdCall = [cmdCall]
                        }
                        for (var i = 0; i < cmdCall.length; i++) {
                            if (alertBot.settings.commandLiteral + cmdCall[i] === cmd) {
                                alertBot.commands[comm].functionality(chat, alertBot.settings.commandLiteral + cmdCall[i]);
                                executed = true;
                                break;
                            }
                        }
                    }

                    if (executed && userPerm === API.ROLE.NONE) {
                        alertBot.room.usercommand = false;
                        setTimeout(function() {
                            alertBot.room.usercommand = true;
                        }, alertBot.settings.commandCooldown * 1000);
                    }
                    if (executed) {
                        /*if (alertBot.settings.cmdDeletion) {
                            API.moderateDeleteChat(chat.cid);
                        }*/

                        //alertBot.room.allcommand = false;
                        //setTimeout(function () {
                        alertBot.room.allcommand = true;
                        //}, 5 * 1000);
                    }
                    return executed;
                },
                action: function(chat) {
                    var user = alertBot.userUtilities.lookupUser(chat.uid);
                    if (chat.type === 'message') {
                        for (var j = 0; j < alertBot.room.users.length; j++) {
                            if (alertBot.userUtilities.getUser(alertBot.room.users[j]).id === chat.uid) {
                                alertBot.userUtilities.setLastActivity(alertBot.room.users[j]);
                            }

                        }
                    }
                    alertBot.room.roomstats.chatmessages++;
                },
                spam: [
                    '???????????????'
                ],
                curses: [
                    'heck'
                ]
            },

            connectAPI: function() {
                this.proxy = {
                    eventChat: $.proxy(this.eventChat, this),
                    eventUserskip: $.proxy(this.eventUserskip, this),
                    eventUserjoin: $.proxy(this.eventUserjoin, this),
                    eventUserleave: $.proxy(this.eventUserleave, this),
                    //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                    eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                    eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                    eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                    eventDjadvance: $.proxy(this.eventDjadvance, this),
                    //eventDjupdate: $.proxy(this.eventDjupdate, this),
                    eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                    eventVoteskip: $.proxy(this.eventVoteskip, this),
                    eventModskip: $.proxy(this.eventModskip, this),
                    eventChatcommand: $.proxy(this.eventChatcommand, this),
                    eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

                };
                API.on(API.CHAT, this.proxy.eventChat);
                API.on(API.USER_SKIP, this.proxy.eventUserskip);
                API.on(API.USER_JOIN, this.proxy.eventUserjoin);
                API.on(API.USER_LEAVE, this.proxy.eventUserleave);
                API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
                API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
                API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
                API.on(API.ADVANCE, this.proxy.eventDjadvance);
                API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
                API.on(API.MOD_SKIP, this.proxy.eventModskip);
                API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
                API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
            },
            disconnectAPI: function() {
                API.off(API.CHAT, this.proxy.eventChat);
                API.off(API.USER_SKIP, this.proxy.eventUserskip);
                API.off(API.USER_JOIN, this.proxy.eventUserjoin);
                API.off(API.USER_LEAVE, this.proxy.eventUserleave);
                API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
                API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
                API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
                API.off(API.ADVANCE, this.proxy.eventDjadvance);
                API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
                API.off(API.MOD_SKIP, this.proxy.eventModskip);
                API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
                API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
            },
            startup: function() {
                var u = API.getUser();
                if (alertBot.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(alertBot.chat.greyuser);
                if (alertBot.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(alertBot.chat.bouncer);
                alertBot.connectAPI();
                API.moderateDeleteChat = function(cid) {
                    $.ajax({
                        url: '/_/chat/' + cid,
                        type: 'DELETE'
                    })
                };

                alertBot.room.name = window.location.pathname;
                var Check;

                console.log(alertBot.room.name);

                var detect = function() {
                    if (alertBot.room.name != window.location.pathname) {
                        console.log('Killing bot after room change.');
                        storeToStorage();
                        alertBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                        if (alertBot.settings.roomLock) {
                            window.location = alertBot.room.name;
                        } else {
                            clearInterval(Check);
                        }
                    }
                };

                Check = setInterval(function() {
                    detect()
                }, 20000);

                retrieveSettings();
                retrieveFromStorage();
                window.bot = alertBot;
                alertBot.roomUtilities.updateBlacklists();
                setInterval(alertBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
                alertBot.getNewBlacklistedSongs = alertBot.roomUtilities.exportNewBlacklistedSongs;
                alertBot.logNewBlacklistedSongs = alertBot.roomUtilities.logNewBlacklistedSongs;
                if (alertBot.room.roomstats.launchTime === null) {
                    alertBot.room.roomstats.launchTime = Date.now();
                }

                for (var j = 0; j < alertBot.room.users.length; j++) {
                    alertBot.room.users[j].inRoom = false;
                }
                var userlist = API.getUsers();
                for (var i = 0; i < userlist.length; i++) {
                    var known = false;
                    var ind = null;
                    for (var j = 0; j < alertBot.room.users.length; j++) {
                        if (alertBot.room.users[j].id === userlist[i].id) {
                            known = true;
                            ind = j;
                        }
                    }
                    if (known) {
                        alertBot.room.users[ind].inRoom = true;
                    } else {
                        alertBot.room.users.push(new alertBot.User(userlist[i].id, userlist[i].username));
                        ind = alertBot.room.users.length - 1;
                    }
                    var wlIndex = API.getWaitListPosition(alertBot.room.users[ind].id) + 1;
                    alertBot.userUtilities.updatePosition(alertBot.room.users[ind], wlIndex);
                }
                alertBot.room.afkInterval = setInterval(function() {
                    alertBot.roomUtilities.afkCheck()
                }, 10 * 1000);
                alertBot.room.autodisableInterval = setInterval(function() {
                    alertBot.room.autodisableFunc();
                }, 60 * 60 * 1000);
                alertBot.loggedInID = API.getUser().id;
                alertBot.status = true;
                API.sendChat('/cap ' + alertBot.settings.startupCap);
                API.setVolume(alertBot.settings.startupVolume);
                if (alertBot.settings.autowoot) {
                    $('#woot').click();
                }
                if (alertBot.settings.startupEmoji) {
                    var emojibuttonoff = $('.icon-emoji-off');
                    if (emojibuttonoff.length > 0) {
                        emojibuttonoff[0].click();
                    }
                    API.chatLog(':smile: Emojis enabled.');
                } else {
                    var emojibuttonon = $('.icon-emoji-on');
                    if (emojibuttonon.length > 0) {
                        emojibuttonon[0].click();
                    }
                    API.chatLog('Emojis disabled.');
                }
                API.chatLog('Avatars capped at ' + alertBot.settings.startupCap);
                API.chatLog('Volume set to ' + alertBot.settings.startupVolume);
                //socket();
                API.chatLog('AlertBot 0.0.1 online COGGERS');
            },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = alertBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'host':
                    case 'host':
                        minPerm = API.ROLE.HOST;
                        break;
                    case 'cohost':
                        minPerm = API.ROLE.COHOST;
                        break;
                    case 'manager':
                        minPerm = API.ROLE.MANAGER;
                        break;
                    case 'mod':
                        if (alertBot.settings.bouncerPlus) {
                            minPerm = API.ROLE.BOUNCER;
                        } else {
                            minPerm = API.ROLE.MANAGER;
                        }
                        break;
                    case 'bouncer':
                        minPerm = API.ROLE.BOUNCER;
                        break;
                    case 'residentdj':
                        minPerm = API.ROLE.DJ;
                        break;
                    case 'user':
                        minPerm = API.ROLE.NONE;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },


            // START OF COMMANDS

          		// START OF CUSTOM COMMANDS

          			/*
                      command: {
                          command: 'cmd',
                          rank: 'user/bouncer/mod/manager',
                          type: 'startsWith/exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {

                              }
                          }
                      },
                      */



                      //Explain Resident DJ role

                                 rdjCommand: {
                                           command: ['rdj'],
                                           rank: 'user',
                                           type: 'startsWith',
                                           functionality: function(chat, cmd) {

                                             var msg = chat.message;
                                             var cmdmsg = msg.substr(cmd.length + 1);

                                               if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                               if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                               else {
                                                          API.sendChat(cmdmsg + 'The resident DJ role is given to people who have made creative contributions to the community with songs, emotes, etc. RDJs are not part of staff but they get a custom icon, color and other stuff.');
                                               }
                                           }
                                       },







                      //pepepls

                                 pepeplsCommand: {
                                           command: ['pepepls'],
                                           rank: 'residentdj',
                                           type: 'startsWith',
                                           functionality: function(chat, cmd) {

                                             var msg = chat.message;
                                             var cmdmsg = msg.substr(cmd.length + 1);

                                               if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                               if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                               else {
                                                          API.sendChat(cmdmsg + ' https://thumbs.gfycat.com/UnconsciousGorgeousAxisdeer-max-1mb.gif');
                                               }
                                           }
                                       },

                      //heart

                                 heartCommand: {
                                           command: ['heart'],
                                           rank: 'residentdj',
                                           type: 'startsWith',
                                           functionality: function(chat, cmd) {

                                            var msg = chat.message;
                                            var cmdmsg = msg.substr(cmd.length + 1);

                                               if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                               if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                               else {
                                                          API.sendChat(cmdmsg + 'https://media.giphy.com/media/37QV3rY44VzodzMdX8/giphy.gif');
                                               }
                                           }
                                       },



                      //blacklist the previous song

                      blacklistpreviousCommand: {
                                      command: ['blacklistprevious', 'blp'],
                                      rank: 'bouncer',
                                      type: 'startsWith',
                                      functionality: function(chat, cmd) {
                                          if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                          else {
                                              var msg = chat.message;
                                              var lastplay = API.getHistory()[1];
                                              if (typeof lastplay === 'undefined') return;
                                              var list;
                                              if (msg.length === cmd.length) list = 'BANNED';
                                              else list = msg.substring(cmd.length + 1);
                                              var media = lastplay.media;

                                              var track = {
                                                  list: list,
                                                  author: media.author,
                                                  title: media.title,
                                                  mid: media.format + ':' + media.cid
                                              };
                                              alertBot.room.newBlacklisted.push(track);
                                              alertBot.room.blacklists[list].push(media.format + ':' + media.cid);
                                              API.sendChat('! Confirmed.');
                                              API.chatLog(subChat(alertBot.chat.newblacklisted, {
                                                  name: chat.un,
                                                  blacklist: list,
                                                  author: media.author,
                                                  title: media.title,
                                                  mid: media.format + ':' + media.cid
                                              }));

                                              if (typeof alertBot.room.newBlacklistedSongFunction === 'function') {
                                                  alertBot.room.newBlacklistedSongFunction(track);
                                                    }
                                                }
                                            }
                                         },


                      //Print ID of user in chat, regardless of if they are still in the room.

                      idCommand: {
                          command: 'id',
                          rank: 'user',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var name;
                                  if (msg.length === cmd.length) name = chat.un;
                                  else {
                                      name = msg.substr(cmd.length + 1);
                                  }
                              }
                              var id = alertBot.userUtilities.getID(name);

                              if (id) {
                                API.sendChat('/me @' + chat.un + ' ' + name + '\'s ID is "' + id + '".');
                              }
                              else {
                                API.sendChat('/me @' + chat.un + ' Invalid user specified.');
                                 }

                                }
                             },

                      // no u
                  		nouCommand: {
                                  command: ['nou'],
                                  rank: 'residentdj',
                                  type: 'startsWith',
                                  functionality: function(chat, cmd) {

                  					var msg = chat.message;
                  					var cmdmsg = msg.substr(cmd.length + 1);

                                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                      if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                      else {
                  	                       API.sendChat(cmdmsg + ' no u');
                                       }
                                    }
                                },

                      // say

                      	sayCommand: {
                                  command: ['say'],
                                  rank: 'manager',
                                  type: 'startsWith',
                                  functionality: function(chat, cmd) {

                            				var msg = chat.message;
                            				var cmdmsg = msg.substr(cmd.length + 1);

                                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                      if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                      else {
                                                 API.sendChat(cmdmsg);
                                      }
                                  }
                              },

                      // chu say brug?

                    	chusayCommand: {
                                  command: ['chusay', 'brug', 'feelsweirdbrug'],
                                  rank: 'residentdj',
                                  type: 'startsWith',
                                  functionality: function(chat, cmd) {

                  					var msg = chat.message;
                  					var cmdmsg = msg.substr(cmd.length + 1);

                                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                      if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                      else {
                  	                       API.sendChat(cmdmsg + ' https://i.imgur.com/Y5Zx98w.gif');
                                      }
                                  }
                              },

                      // @user with WeirdChamp

                    	weirdchampCommand: {
                                    command: ['weirdchamp', 'weird'],
                                    rank: 'residentdj',
                                    type: 'startsWith',
                                    functionality: function(chat, cmd) {

                    					var msg = chat.message;
                    					var cmdmsg = msg.substr(cmd.length + 1);

                                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                        if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                        else {

                    						API.sendChat(subChat(alertBot.chat.weirdchamp, {
                                                name: cmdmsg,
                                            }));
                                        }
                                    }
                                },

                    	//(◕‿◕✿) CHAT IS RUNNING IN POSITIVE CHAT OR BAN MODE (◕‿◕✿)

                    	attitudeCommand: {
                                    command: ['attitude', 'negativity'],
                                    rank: 'residentdj',
                                    type: 'startsWith',
                                    functionality: function(chat, cmd) {

                    					var msg = chat.message;
                    					var cmdmsg = msg.substr(cmd.length + 1);

                                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                        if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                        else {

                    						API.sendChat(subChat(alertBot.chat.attitude, {
                                                name: cmdmsg,
                                            }));
                                        }
                                    }
                                },

                      // MrDestructoid clapping

                    	clapCommand: {
                    		  command: 'clap',
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat(":MrDestructoid: :bttvClap:");
                                }
                              }
                            },


                            //MrDestructoid in natural habitat
                            mackygeeCommand: {
                              command: ['mackygee', 'macky'],
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("https://i.imgur.com/LABtfS6.gif");
                                }
                              }
                            },

                            //MrDestructoid woots
                            wootCommand: {
                              command: 'woot',
                              rank: 'residentdj',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("/woot");
                                  API.sendChat(":MrDestructoid: :bttvClap:");
                                }
                              }
                            },

                            //MrDestructoid ResidentSleeper
                            ResidentSleeperCommand: {
                              command: 'sleeper',
                              rank: 'residentdj',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("ResidentSleeper Clap");
                                }
                              }
                            },

                            //MrDestructoid sparkle
                            sparkleCommand: {
                              command: 'sparkle',
                              rank: 'residentdj',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("/sparkle");
                                }
                              }
                            },

                            //Exports the chat to local storage .txt
                            exportchatCommand: {
                              command: 'exportchat',
                              rank: 'manager',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("/exportchat");
                                }
                              }
                            },

                            //cute robot
                            ayayaCommand: {
                              command: 'ayaya',
                              rank: 'residentdj',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("AYAYA Clap");
                                }
                              }
                            },

                            //MrDestructoid voteemotespam
                            voteemotespamCommand: {
                              command: 'votespam',
                              rank: 'manager',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("/voteemotespam");
                                }
                              }
                            },

                            // Nightcore command
                            nightcoreCommand: {
                              command: 'nightcore',
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("MrDestructoid says: If you're about to queue a nightcore song, just look up the original and queue that instead.");
                                }
                              }
                            },

                            // Show commands
                            commandsCommand: {
                              command: 'commands',
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("Find the bot commands for this channel here: https://git.io/fN5eb#bot-commands");
                                }
                              }
                            },

                             // RCS help
                            rcsCommand: {
                              command: 'rcs',
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("The RCS extension is an enhancement for plug.dj. Install it so you can see our custom channel theme! https://rcs.radiant.dj");
                                }
                              }
                            },

                             // Emotes help
                            emotesCommand: {
                              command: ['emotes', 'downloadpoggers'],
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("To use emotes when you have RCS installed type colons like :this:. Alternatively, install the GTE extension and add xqcow in the settings: https://chrome.google.com/webstore/detail/global-twitch-emotes/pgniedifoejifjkndekolimjeclnokkb");
                                }
                              }
                            },

                             // Twitch link
                            twitchCommand: {
                              command: 'twitch',
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("xQc's Twitch: https://www.twitch.tv/xqcow");
                                }
                              }
                            },

                             // Discord link
                            discordCommand: {
                              command: 'discord',
                              rank: 'user',
                              type: 'exact',
                              functionality: function (chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                                else {
                                  API.sendChat("xQc's Discord: https://discord.gg/xqcow");
                                }
                              }
                            },




                    		//END OF CUSTOM COMMANDS


                      activeCommand: {
                          command: 'active',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var now = Date.now();
                                  var chatters = 0;
                                  var time;

                                  var launchT = alertBot.room.roomstats.launchTime;
                                  var durationOnline = Date.now() - launchT;
                                  var since = durationOnline / 1000;

                                  if (msg.length === cmd.length) time = since;
                                  else {
                                      time = msg.substring(cmd.length + 1);
                                      if (isNaN(time)) return API.sendChat(subChat(alertBot.chat.invalidtime, {
                                          name: chat.un
                                      }));
                                  }
                                  for (var i = 0; i < alertBot.room.users.length; i++) {
                                      userTime = alertBot.userUtilities.getLastActivity(alertBot.room.users[i]);
                                      if ((now - userTime) <= (time * 60 * 1000)) {
                                          chatters++;
                                      }
                                  }
                                  API.sendChat(subChat(alertBot.chat.activeusersintime, {
                                      name: chat.un,
                                      amount: chatters,
                                      time: time
                                  }));
                              }
                          }
                      },

                      addCommand: {
                          command: 'add',
                          rank: 'mod',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var name = msg.substr(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (msg.length > cmd.length + 2) {
                                      if (typeof user !== 'undefined') {
                                          if (alertBot.room.roomevent) {
                                              alertBot.room.eventArtists.push(user.id);
                                          }
                                          API.moderateAddDJ(user.id);
                                      } else API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                          name: chat.un
                                      }));
                                  }
                              }
                          }
                      },

                      afklimitCommand: {
                      			command: ['afklimit', 'maximumafk', 'maxafktime'],
                                      rank: 'manager',
                                      type: 'startsWith',
                                      functionality: function(chat, cmd) {
                                          if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                          if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                                          else {
                                              var msg = chat.message;
                                              if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nolimitspecified, {
                                                  name: chat.un
                                              }));
                                              var limit = msg.substring(cmd.length + 1);
                                              if (!isNaN(limit)) {
                                                  alertBot.settings.maximumAfk = parseInt(limit, 10);
                                                  API.sendChat(subChat(alertBot.chat.maximumafktimeset, {
                                                      name: chat.un,
                                                      time: alertBot.settings.maximumAfk
                                                  }));
                                              } else API.sendChat(subChat(alertBot.chat.invalidlimitspecified, {
                                                  name: chat.un
                                              }));
                                          }
                                      }
                                  },

                      afkremovalCommand: {
                          command: 'afkremoval',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.afkRemoval) {
                                      alertBot.settings.afkRemoval = !alertBot.settings.afkRemoval;
                                      clearInterval(alertBot.room.afkInterval);
                                      API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.afkremoval
                                      }));
                                  } else {
                                      alertBot.settings.afkRemoval = !alertBot.settings.afkRemoval;
                                      alertBot.room.afkInterval = setInterval(function() {
                                          alertBot.roomUtilities.afkCheck()
                                      }, 2 * 1000);
                                      API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.afkremoval
                                      }));
                                  }
                              }
                          }
                      },

                      afkresetCommand: {
                          command: 'afkreset',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var name = msg.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  alertBot.userUtilities.setLastActivity(user);
                                  API.sendChat(subChat(alertBot.chat.afkstatusreset, {
                                      name: chat.un,
                                      username: name
                                  }));
                              }
                          }
                      },

                      afktimeCommand: {
                          command: 'afktime',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var name = msg.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  var lastActive = alertBot.userUtilities.getLastActivity(user);
                                  var inactivity = Date.now() - lastActive;
                                  var time = alertBot.roomUtilities.msToStr(inactivity);

                                  var launchT = alertBot.room.roomstats.launchTime;
                                  var durationOnline = Date.now() - launchT;

                                  if (inactivity == durationOnline) {
                                      API.sendChat(subChat(alertBot.chat.inactivelonger, {
                                          botname: alertBot.settings.botName,
                                          name: chat.un,
                                          username: name
                                      }));
                                  } else {
                                      API.sendChat(subChat(alertBot.chat.inactivefor, {
                                          name: chat.un,
                                          username: name,
                                          time: time
                                      }));
                                  }
                              }
                          }
                      },

                      autodisableCommand: {
                          command: 'autodisable',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.autodisable) {
                                      alertBot.settings.autodisable = !alertBot.settings.autodisable;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.autodisable
                                      }));
                                  } else {
                                      alertBot.settings.autodisable = !alertBot.settings.autodisable;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.autodisable
                                      }));
                                  }

                              }
                          }
                      },

                      autoskipCommand: {
                          command: 'autoskip',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.autoskip) {
                                      alertBot.settings.autoskip = !alertBot.settings.autoskip;
                                      clearTimeout(alertBot.room.autoskipTimer);
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.autoskip
                                      }));
                                  } else {
                                      alertBot.settings.autoskip = !alertBot.settings.autoskip;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.autoskip
                                      }));
                                  }
                              }
                          }
                      },

                      autowootCommand: {
                          command: 'autowoot',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat(alertBot.chat.autowoot);
                              }
                          }
                      },

                      baCommand: {
                          command: 'ba',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat(alertBot.chat.brandambassador);
                              }
                          }
                      },

                      ballCommand: {
                          command: ['8ball', 'ask'],
                          rank: 'user',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var crowd = API.getUsers();
                                  var msg = chat.message;
                                  var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                                  var randomUser = Math.floor(Math.random() * crowd.length);
                                  var randomBall = Math.floor(Math.random() * alertBot.chat.balls.length);
                                  var randomSentence = Math.floor(Math.random() * 1);
                                  API.sendChat(subChat(alertBot.chat.ball, {
                                      name: chat.un,
                                      botname: alertBot.settings.botName,
                                      question: argument,
                                      response: alertBot.chat.balls[randomBall]
                                  }));
                              }
                          }
                      },

                      blacklistCommand: {
                          command: ['blacklist', 'bl'],
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var list;
                                  var msg = chat.message;

                                  if (msg.length === cmd.length) list = 'BANNED';
                                  else list = msg.substring(cmd.length + 1);

                                  var media = API.getMedia();
                                  var timeLeft = API.getTimeRemaining();
                                  var timeElapsed = API.getTimeElapsed();
                                  var track = {
                                      list: list,
                                      author: media.author,
                                      title: media.title,
                                      mid: media.format + ':' + media.cid
                                  };
                                  alertBot.room.newBlacklisted.push(track);
                                  alertBot.room.blacklists[list].push(media.format + ':' + media.cid);
                                  API.sendChat('/me Added.');
                                  API.chatLog(subChat(alertBot.chat.newblacklisted, {
                                      name: chat.un,
                                      blacklist: list,
                                      author: media.author,
                                      title: media.title,
                                      mid: media.format + ':' + media.cid
                                  }));
                                  if (alertBot.settings.smartSkip && timeLeft > timeElapsed) {
                                      alertBot.roomUtilities.smartSkip();
                                  } else {
                                      API.moderateForceSkip();
                                  }
                                  if (typeof alertBot.room.newBlacklistedSongFunction === 'function') {
                                      alertBot.room.newBlacklistedSongFunction(track);
                                        }
                                    }
                                }
                            },

                      blinfoCommand: {
                          command: 'blinfo',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var author = API.getMedia().author;
                                  var title = API.getMedia().title;
                                  var name = chat.un;
                                  var format = API.getMedia().format;
                                  var cid = API.getMedia().cid;
                                  var songid = format + ':' + cid;

                                  API.sendChat(subChat(alertBot.chat.blinfo, {
                                      name: name,
                                      author: author,
                                      title: title,
                                      songid: songid
                                  }));
                              }
                          }
                      },

                      bouncerPlusCommand: {
                          command: 'bouncer+',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (alertBot.settings.bouncerPlus) {
                                      alertBot.settings.bouncerPlus = false;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': 'Bouncer+'
                                      }));
                                  } else {
                                      if (!alertBot.settings.bouncerPlus) {
                                          var id = chat.uid;
                                          var perm = alertBot.userUtilities.getPermission(id);
                                          if (perm > API.ROLE.BOUNCER) {
                                              alertBot.settings.bouncerPlus = true;
                                              return API.sendChat(subChat(alertBot.chat.toggleon, {
                                                  name: chat.un,
                                                  'function': 'Bouncer+'
                                              }));
                                          }
                                      } else return API.sendChat(subChat(alertBot.chat.bouncerplusrank, {
                                          name: chat.un
                                      }));
                                  }
                              }
                          }
                      },

                      botnameCommand: {
                          command: 'botname',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length <= cmd.length + 1) return API.sendChat(subChat(alertBot.chat.currentbotname, {
                                      botname: alertBot.settings.botName
                                  }));
                                  var argument = msg.substring(cmd.length + 1);
                                  if (argument) {
                                      alertBot.settings.botName = argument;
                                      API.sendChat(subChat(alertBot.chat.botnameset, {
                                          botName: alertBot.settings.botName
                                      }));
                                  }
                              }
                          }
                      },

                      clearchatCommand: {
                          command: 'clearchat',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var currentchat = $('#chat-messages').children();
                                  for (var i = 0; i < currentchat.length; i++) {
                                      API.moderateDeleteChat(currentchat[i].getAttribute('data-cid'));
                                  }
                                  return API.sendChat(subChat(alertBot.chat.chatcleared, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      clearlocalstorageCommand: {
                          command: 'clearlocalstorage',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  localStorage.clear();
                                  API.chatLog('Cleared localstorage, please refresh the page!');
                              }
                          }
                      },

                      cmddeletionCommand: {
                          command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.cmdDeletion) {
                                      alertBot.settings.cmdDeletion = !alertBot.settings.cmdDeletion;
                                      API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.cmddeletion
                                      }));
                                  } else {
                                      alertBot.settings.cmdDeletion = !alertBot.settings.cmdDeletion;
                                      API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.cmddeletion
                                      }));
                                  }
                              }
                          }
                      },

                      cookieCommand: {
                          command: 'cookie',
                          rank: 'user',
                          type: 'startsWith',
                          getCookie: function(chat) {
                              var c = Math.floor(Math.random() * alertBot.chat.cookies.length);
                              return alertBot.chat.cookies[c];
                          },
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;

                                  var space = msg.indexOf(' ');
                                  if (space === -1) {
                                      API.sendChat(alertBot.chat.eatcookie);
                                      return false;
                                  } else {
                                      var name = msg.substring(space + 2);
                                      var user = alertBot.userUtilities.lookupUserName(name);
                                      if (user === false || !user.inRoom) {
                                          return API.sendChat(subChat(alertBot.chat.nousercookie, {
                                              name: name
                                          }));
                                      } else if (user.username === chat.un) {
                                          return API.sendChat(subChat(alertBot.chat.selfcookie, {
                                              name: name
                                          }));
                                      } else {
                                          return API.sendChat(subChat(alertBot.chat.cookie, {
                                              nameto: user.username,
                                              namefrom: chat.un,
                                              cookie: this.getCookie()
                                          }));
                                      }
                                  }
                              }
                          }
                      },

                      cycleCommand: {
                          command: 'cycle',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  alertBot.roomUtilities.changeDJCycle();
                              }
                          }
                      },

                      cycleguardCommand: {
                          command: 'cycleguard',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.cycleGuard) {
                                      alertBot.settings.cycleGuard = !alertBot.settings.cycleGuard;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.cycleguard
                                      }));
                                  } else {
                                      alertBot.settings.cycleGuard = !alertBot.settings.cycleGuard;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.cycleguard
                                      }));
                                  }

                              }
                          }
                      },

                      cycletimerCommand: {
                          command: 'cycletimer',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var cycleTime = msg.substring(cmd.length + 1);
                                  if (!isNaN(cycleTime) && cycleTime !== '') {
                                      alertBot.settings.maximumCycletime = cycleTime;
                                      return API.sendChat(subChat(alertBot.chat.cycleguardtime, {
                                          name: chat.un,
                                          time: alertBot.settings.maximumCycletime
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.invalidtime, {
                                      name: chat.un
                                  }));

                              }
                          }
                      },

                      dclookupCommand: {
                          command: ['dclookup', 'dc'],
                          rank: 'user',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var name;
                                  if (msg.length === cmd.length) name = chat.un;
                                  else {
                                      name = msg.substring(cmd.length + 2);
                                      var perm = alertBot.userUtilities.getPermission(chat.uid);
                                      if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(alertBot.chat.dclookuprank, {
                                          name: chat.un
                                      }));
                                  }
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  var toChat = alertBot.userUtilities.dclookup(user.id);
                                  API.sendChat(toChat);
                              }
                          }
                      },

                      /*
                      // This does not work anymore.
                      deletechatCommand: {
                          command: 'deletechat',
                          rank: 'mod',
                          type: 'startsWith',
                          functionality: function (chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void (0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {name: chat.un}));
                                  var name = msg.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {name: chat.un}));
                                  var chats = $('.from');
                                  var message = $('.message');
                                  var emote = $('.emote');
                                  var from = $('.un.clickable');
                                  for (var i = 0; i < chats.length; i++) {
                                      var n = from[i].textContent;
                                      if (name.trim() === n.trim()) {

                                          // var messagecid = $(message)[i].getAttribute('data-cid');
                                          // var emotecid = $(emote)[i].getAttribute('data-cid');
                                          // API.moderateDeleteChat(messagecid);

                                          // try {
                                          //     API.moderateDeleteChat(messagecid);
                                          // }
                                          // finally {
                                          //     API.moderateDeleteChat(emotecid);
                                          // }

                                          if (typeof $(message)[i].getAttribute('data-cid') == 'undefined'){
                                              API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                          } else {
                                              API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                          }
                                      }
                                  }
                                  API.sendChat(subChat(alertBot.chat.deletechat, {name: chat.un, username: name}));
                              }
                          }
                      },
                      */

                      deletechatCommand: {
                          command: 'deletechat',
                          rank: 'mod',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var name = msg.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  for (var i = 1; i < alertBot.room.chatMessages.length; i++) {
                                      if (alertBot.room.chatMessages[i].indexOf(user.id) > -1) {
                                          API.moderateDeleteChat(alertBot.room.chatMessages[i][0]);
                                          alertBot.room.chatMessages[i].splice(0);
                                      }
                                  }
                                  API.sendChat(subChat(alertBot.chat.deletechat, {
                                      name: chat.un,
                                      username: name
                                  }));
                              }
                          }
                      },

                      emojiCommand: {
                          command: 'emoji',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var link = 'http://www.emoji-cheat-sheet.com/';
                                  API.sendChat(subChat(alertBot.chat.emojilist, {
                                      link: link
                                  }));
                              }
                          }
                      },

                      englishCommand: {
                          command: 'english',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                                  var name = chat.message.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                                  var lang = alertBot.userUtilities.getUser(user).language;
                                  var ch = '/me @' + name + ' ';
                                  switch (lang) {
                                      case 'en':
                                          break;
                                      case 'da':
                                          ch += 'Vær venlig at tale engelsk.';
                                          break;
                                      case 'de':
                                          ch += 'Bitte sprechen Sie Englisch.';
                                          break;
                                      case 'es':
                                          ch += 'Por favor, hable Inglés.';
                                          break;
                                      case 'fr':
                                          ch += 'Parlez anglais, s\'il vous plaît.';
                                          break;
                                      case 'nl':
                                          ch += 'Spreek Engels, alstublieft.';
                                          break;
                                      case 'pl':
                                          ch += 'Proszę mówić po angielsku.';
                                          break;
                                      case 'pt':
                                          ch += 'Por favor, fale Inglês.';
                                          break;
                                      case 'sk':
                                          ch += 'Hovorte po anglicky, prosím.';
                                          break;
                                      case 'cs':
                                          ch += 'Mluvte prosím anglicky.';
                                          break;
                                      case 'sr':
                                          ch += 'Молим Вас, говорите енглески.';
                                          break;
                                  }
                                  ch += ' English please.';
                                  API.sendChat(ch);
                              }
                          }
                      },

                      etaCommand: {
                          command: 'eta',
                          rank: 'user',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var perm = alertBot.userUtilities.getPermission(chat.uid);
                                  var msg = chat.message;
                                  var dj = API.getDJ().username;
                                  var name;
                                  if (msg.length > cmd.length) {
                                      if (perm < API.ROLE.BOUNCER) return void(0);
                                      name = msg.substring(cmd.length + 2);
                                  } else name = chat.un;
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  var pos = API.getWaitListPosition(user.id);
                                  var realpos = pos + 1;
                                  if (name == dj) return API.sendChat(subChat(alertBot.chat.youaredj, {
                                      name: name
                                  }));
                                  if (pos < 0) return API.sendChat(subChat(alertBot.chat.notinwaitlist, {
                                      name: name
                                  }));
                                  if (pos == 0) return API.sendChat(subChat(alertBot.chat.youarenext, {
                                      name: name
                                  }));
                                  var timeRemaining = API.getTimeRemaining();
                                  var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                                  var estimateString = alertBot.roomUtilities.msToStr(estimateMS);
                                  API.sendChat(subChat(alertBot.chat.eta, {
                                      name: name,
                                      time: estimateString,
                                      position: realpos
                                  }));
                              }
                          }
                      },

                      filterCommand: {
                          command: 'filter',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.filterChat) {
                                      alertBot.settings.filterChat = !alertBot.settings.filterChat;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.chatfilter
                                      }));
                                  } else {
                                      alertBot.settings.filterChat = !alertBot.settings.filterChat;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.chatfilter
                                      }));
                                  }
                              }
                          }
                      },

                      forceskipCommand: {
                          command: ['forceskip', 'fs'],
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat(subChat(alertBot.chat.forceskip, {
                                      name: chat.un
                                  }));
                                  API.moderateForceSkip();
                                  alertBot.room.skippable = false;
                                  setTimeout(function() {
                                      alertBot.room.skippable = true
                                  }, 5 * 1000);
                              }
                          }
                      },

                      ghostbusterCommand: {
                          command: 'ghostbuster',
                          rank: 'user',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var name;
                                  if (msg.length === cmd.length) name = chat.un;
                                  else {
                                      name = msg.substr(cmd.length + 2);
                                  }
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (user === false || !user.inRoom) {
                                      return API.sendChat(subChat(alertBot.chat.ghosting, {
                                          name1: chat.un,
                                          name2: name
                                      }));
                                  } else API.sendChat(subChat(alertBot.chat.notghosting, {
                                      name1: chat.un,
                                      name2: name
                                  }));
                              }
                          }
                      },

                      gifCommand: {
                          command: ['gif', 'giphy'],
                          rank: 'user',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length !== cmd.length) {
                                      function get_id(api_key, fixedtag, func) {
                                          $.getJSON(
                                              'https://tv.giphy.com/v1/gifs/random?', {
                                                  'format': 'json',
                                                  'api_key': api_key,
                                                  'rating': rating,
                                                  'tag': fixedtag
                                              },
                                              function(response) {
                                                  func(response.data.id);
                                              }
                                          )
                                      }
                                      var api_key = 'dc6zaTOxFJmzC'; // public beta key
                                      var rating = 'pg-13'; // PG 13 gifs
                                      var tag = msg.substr(cmd.length + 1);
                                      var fixedtag = tag.replace(/ /g, '+');
                                      var commatag = tag.replace(/ /g, ', ');
                                      get_id(api_key, tag, function(id) {
                                          if (typeof id !== 'undefined') {
                                              API.sendChat(subChat(alertBot.chat.validgiftags, {
                                                  name: chat.un,
                                                  id: id,
                                                  tags: commatag
                                              }));
                                          } else {
                                              API.sendChat(subChat(alertBot.chat.invalidgiftags, {
                                                  name: chat.un,
                                                  tags: commatag
                                              }));
                                          }
                                      });
                                  } else {
                                      function get_random_id(api_key, func) {
                                          $.getJSON(
                                              'https://tv.giphy.com/v1/gifs/random?', {
                                                  'format': 'json',
                                                  'api_key': api_key,
                                                  'rating': rating
                                              },
                                              function(response) {
                                                  func(response.data.id);
                                              }
                                          )
                                      }
                                      var api_key = 'dc6zaTOxFJmzC'; // public beta key
                                      var rating = 'pg-13'; // PG 13 gifs
                                      get_random_id(api_key, function(id) {
                                          if (typeof id !== 'undefined') {
                                              API.sendChat(subChat(alertBot.chat.validgifrandom, {
                                                  name: chat.un,
                                                  id: id
                                              }));
                                          } else {
                                              API.sendChat(subChat(alertBot.chat.invalidgifrandom, {
                                                  name: chat.un
                                              }));
                                          }
                                      });
                                  }
                              }
                          }
                      },

                      helpCommand: {
                          command: ['help','starterhelp'],
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var link = '(Updated link coming soon)';
                                  API.sendChat(subChat(alertBot.chat.starterhelp, {
                                      link: link
                                  }));
                              }
                          }
                      },

                      historyskipCommand: {
                          command: 'historyskip',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.historySkip) {
                                      alertBot.settings.historySkip = !alertBot.settings.historySkip;
                                      API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.historyskip
                                      }));
                                  } else {
                                      alertBot.settings.historySkip = !alertBot.settings.historySkip;
                                      API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.historyskip
                                      }));
                                  }
                              }
                          }
                      },

                      joinCommand: {
                          command: 'join',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.room.roulette.rouletteStatus && alertBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                                      alertBot.room.roulette.participants.push(chat.uid);
                                      API.sendChat(subChat(alertBot.chat.roulettejoin, {
                                          name: chat.un
                                      }));
                                  }
                              }
                          }
                      },

                      jointimeCommand: {
                          command: 'jointime',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var name = msg.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  var join = alertBot.userUtilities.getJointime(user);
                                  var time = Date.now() - join;
                                  var timeString = alertBot.roomUtilities.msToStr(time);
                                  API.sendChat(subChat(alertBot.chat.jointime, {
                                      namefrom: chat.un,
                                      username: name,
                                      time: timeString
                                  }));
                              }
                          }
                      },

                      kickCommand: {
                          command: 'kick',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var lastSpace = msg.lastIndexOf(' ');
                                  var time;
                                  var name;
                                  if (lastSpace === msg.indexOf(' ')) {
                                      time = 0.25;
                                      name = msg.substring(cmd.length + 2);
                                  } else {
                                      time = msg.substring(lastSpace + 1);
                                      name = msg.substring(cmd.length + 2, lastSpace);
                                  }

                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  var from = chat.un;
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));

                                  var permFrom = alertBot.userUtilities.getPermission(chat.uid);
                                  var permTokick = alertBot.userUtilities.getPermission(user.id);

                                  if (permFrom <= permTokick)
                                      return API.sendChat(subChat(alertBot.chat.kickrank, {
                                          name: chat.un
                                      }));

                                  if (!isNaN(time)) {
                                      API.sendChat(subChat(alertBot.chat.kick, {
                                          name: chat.un,
                                          username: name,
                                          time: time
                                      }));
                                      if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                                      else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                                      setTimeout(function(id, name) {
                                          API.moderateUnbanUser(id);
                                          console.log('Unbanned @' + name + '. (' + id + ')');
                                      }, time * 60 * 1000, user.id, name);
                                  } else API.sendChat(subChat(alertBot.chat.invalidtime, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      killCommand: {
                          command: 'kill',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  storeToStorage();
                                  //sendToSocket();
                                  API.sendChat(alertBot.chat.kill);
                                  alertBot.disconnectAPI();
                                  setTimeout(function() {
                                      kill();
                                  }, 1000);
                              }
                          }
                      },

                      languageCommand: {
                          command: 'language',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length <= cmd.length + 1) return API.sendChat(subChat(alertBot.chat.currentlang, {
                                      language: alertBot.settings.language
                                  }));
                                  var argument = msg.substring(cmd.length + 1);

                                  $.get('https://rawgit.com/HarryMcKenzie/source/master/lang/langIndex.json', function(json) {
                                      var langIndex = json;
                                      var link = langIndex[argument.toLowerCase()];
                                      if (typeof link === 'undefined') {
                                          API.sendChat(subChat(alertBot.chat.langerror, {
                                              link: 'http://git.io/vJ9nI'
                                          }));
                                      } else {
                                          alertBot.settings.language = argument;
                                          loadChat();
                                          API.sendChat(subChat(alertBot.chat.langset, {
                                              language: alertBot.settings.language
                                          }));
                                      }
                                  });
                              }
                          }
                      },

                      leaveCommand: {
                          command: 'leave',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var ind = alertBot.room.roulette.participants.indexOf(chat.uid);
                                  if (ind > -1) {
                                      alertBot.room.roulette.participants.splice(ind, 1);
                                      API.sendChat(subChat(alertBot.chat.rouletteleave, {
                                          name: chat.un
                                      }));
                                  }
                              }
                          }
                      },

                      linkCommand: {
                          command: 'link',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var media = API.getMedia();
                                  var from = chat.un;
                                  var user = alertBot.userUtilities.lookupUser(chat.uid);
                                  var perm = alertBot.userUtilities.getPermission(chat.uid);
                                  var dj = API.getDJ().id;
                                  var isDj = false;
                                  if (dj === chat.uid) isDj = true;
                                  if (perm >= API.ROLE.DJ || isDj) {
                                      if (media.format === 1) {
                                          var linkToSong = 'https://youtu.be/' + media.cid;
                                          API.sendChat(subChat(alertBot.chat.songlink, {
                                              name: from,
                                              link: linkToSong
                                          }));
                                      }
                                      if (media.format === 2) {
                                          SC.get('/tracks/' + media.cid, function(sound) {
                                              API.sendChat(subChat(alertBot.chat.songlink, {
                                                  name: from,
                                                  link: sound.permalink_url
                                              }));
                                          });
                                      }
                                  }
                              }
                          }
                      },

                      lockCommand: {
                          command: 'lock',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  alertBot.roomUtilities.booth.lockBooth();
                              }
                          }
                      },

                      lockdownCommand: {
                          command: 'lockdown',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var temp = alertBot.settings.lockdownEnabled;
                                  alertBot.settings.lockdownEnabled = !temp;
                                  if (alertBot.settings.lockdownEnabled) {
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.lockdown
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                      name: chat.un,
                                      'function': alertBot.chat.lockdown
                                  }));
                              }
                          }
                      },

                      lockguardCommand: {
                          command: 'lockguard',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.lockGuard) {
                                      alertBot.settings.lockGuard = !alertBot.settings.lockGuard;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.lockguard
                                      }));
                                  } else {
                                      alertBot.settings.lockGuard = !alertBot.settings.lockGuard;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.lockguard
                                      }));
                                  }
                              }
                          }
                      },

                      lockskipCommand: {
                          command: 'lockskip',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.room.skippable) {
                                      var dj = API.getDJ();
                                      var id = dj.id;
                                      var name = dj.username;
                                      var msgSend = '@' + name + ': ';
                                      alertBot.room.queueable = false;

                                      if (chat.message.length === cmd.length) {
                                          API.sendChat(subChat(alertBot.chat.usedlockskip, {
                                              name: chat.un
                                          }));
                                          alertBot.roomUtilities.booth.lockBooth();
                                          setTimeout(function(id) {
                                              API.moderateForceSkip();
                                              alertBot.room.skippable = false;
                                              setTimeout(function() {
                                                  alertBot.room.skippable = true
                                              }, 5 * 1000);
                                              setTimeout(function(id) {
                                                  alertBot.userUtilities.moveUser(id, alertBot.settings.lockskipPosition, false);
                                                  alertBot.room.queueable = true;
                                                  setTimeout(function() {
                                                      alertBot.roomUtilities.booth.unlockBooth();
                                                  }, 1000);
                                              }, 1500, id);
                                          }, 1000, id);
                                          return void(0);
                                      }
                                      var validReason = false;
                                      var msg = chat.message;
                                      var reason = msg.substring(cmd.length + 1);
                                      for (var i = 0; i < alertBot.settings.lockskipReasons.length; i++) {
                                          var r = alertBot.settings.lockskipReasons[i][0];
                                          if (reason.indexOf(r) !== -1) {
                                              validReason = true;
                                              msgSend += alertBot.settings.lockskipReasons[i][1];
                                          }
                                      }
                                      if (validReason) {
                                          API.sendChat(subChat(alertBot.chat.usedlockskip, {
                                              name: chat.un
                                          }));
                                          alertBot.roomUtilities.booth.lockBooth();
                                          setTimeout(function(id) {
                                              API.moderateForceSkip();
                                              alertBot.room.skippable = false;
                                              API.sendChat(msgSend);
                                              setTimeout(function() {
                                                  alertBot.room.skippable = true
                                              }, 5 * 1000);
                                              setTimeout(function(id) {
                                                  alertBot.userUtilities.moveUser(id, alertBot.settings.lockskipPosition, false);
                                                  alertBot.room.queueable = true;
                                                  setTimeout(function() {
                                                      alertBot.roomUtilities.booth.unlockBooth();
                                                  }, 1000);
                                              }, 1500, id);
                                          }, 1000, id);
                                          return void(0);
                                      }
                                  }
                              }
                          }
                      },

                      locktimerCommand: {
                          command: 'locktimer',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var lockTime = msg.substring(cmd.length + 1);
                                  if (!isNaN(lockTime) && lockTime !== '') {
                                      alertBot.settings.maximumLocktime = lockTime;
                                      return API.sendChat(subChat(alertBot.chat.lockguardtime, {
                                          name: chat.un,
                                          time: alertBot.settings.maximumLocktime
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.invalidtime, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      logoutCommand: {
                          command: 'logout',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat(subChat(alertBot.chat.logout, {
                                      name: chat.un,
                                      botname: alertBot.settings.botName
                                  }));
                                  setTimeout(function() {
                                      $('.logout').mousedown()
                                  }, 1000);
                              }
                          }
                      },

                      maxlengthCommand: {
                          command: 'maxlength',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var maxTime = msg.substring(cmd.length + 1);
                                  if (!isNaN(maxTime)) {
                                      alertBot.settings.maximumSongLength = maxTime;
                                      return API.sendChat(subChat(alertBot.chat.maxlengthtime, {
                                          name: chat.un,
                                          time: alertBot.settings.maximumSongLength
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.invalidtime, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      mehCommand: {
                          command: 'meh',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  $('#meh').click();
                              }
                          }
                      },

                      motdCommand: {
                          command: 'motd',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + alertBot.settings.motd);
                                  var argument = msg.substring(cmd.length + 1);
                                  if (!alertBot.settings.motdEnabled) alertBot.settings.motdEnabled = !alertBot.settings.motdEnabled;
                                  if (isNaN(argument)) {
                                      alertBot.settings.motd = argument;
                                      API.sendChat(subChat(alertBot.chat.motdset, {
                                          msg: alertBot.settings.motd
                                      }));
                                  } else {
                                      alertBot.settings.motdInterval = argument;
                                      API.sendChat(subChat(alertBot.chat.motdintervalset, {
                                          interval: alertBot.settings.motdInterval
                                      }));
                                  }
                              }
                          }
                      },

                      moveCommand: {
                          command: 'move',
                          rank: 'mod',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var firstSpace = msg.indexOf(' ');
                                  var lastSpace = msg.lastIndexOf(' ');
                                  var pos;
                                  var name;
                                  if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                                      pos = 1;
                                      name = msg.substring(cmd.length + 2);
                                  } else {
                                      pos = parseInt(msg.substring(lastSpace + 1));
                                      name = msg.substring(cmd.length + 2, lastSpace);
                                  }
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  if (user.id === alertBot.loggedInID) return API.sendChat(subChat(alertBot.chat.addbotwaitlist, {
                                      name: chat.un
                                  }));
                                  if (!isNaN(pos)) {
                                      API.sendChat(subChat(alertBot.chat.move, {
                                          name: chat.un
                                      }));
                                      alertBot.userUtilities.moveUser(user.id, pos, false);
                                  } else return API.sendChat(subChat(alertBot.chat.invalidpositionspecified, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      muteCommand: {
                          command: 'mute',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var lastSpace = msg.lastIndexOf(' ');
                                  var time = null;
                                  var name;
                                  if (lastSpace === msg.indexOf(' ')) {
                                      name = msg.substring(cmd.length + 2);
                                      time = 45;
                                  } else {
                                      time = msg.substring(lastSpace + 1);
                                      if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                          return API.sendChat(subChat(alertBot.chat.invalidtime, {
                                              name: chat.un
                                          }));
                                      }
                                      name = msg.substring(cmd.length + 2, lastSpace);
                                  }
                                  var from = chat.un;
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (typeof user === 'boolean') return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  var permUser = alertBot.userUtilities.getPermission(user.id);
                                  if (permUser == API.ROLE.NONE) {
                                      if (time > 45) {
                                          API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                          API.sendChat(subChat(alertBot.chat.mutedmaxtime, {
                                              name: chat.un,
                                              time: '45'
                                          }));
                                      } else if (time === 45) {
                                          API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                          API.sendChat(subChat(alertBot.chat.mutedtime, {
                                              name: chat.un,
                                              username: name,
                                              time: time
                                          }));
                                      } else if (time > 30) {
                                          API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                          API.sendChat(subChat(alertBot.chat.mutedtime, {
                                              name: chat.un,
                                              username: name,
                                              time: time
                                          }));
                                      } else if (time > 15) {
                                          API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                          API.sendChat(subChat(alertBot.chat.mutedtime, {
                                              name: chat.un,
                                              username: name,
                                              time: time
                                          }));
                                      } else {
                                          API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                          API.sendChat(subChat(alertBot.chat.mutedtime, {
                                              name: chat.un,
                                              username: name,
                                              time: time
                                          }));
                                      }
                                  } else API.sendChat(subChat(alertBot.chat.muterank, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      opCommand: {
                          command: 'op',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (typeof alertBot.settings.opLink === 'string')
                                      return API.sendChat(subChat(alertBot.chat.oplist, {
                                          link: alertBot.settings.opLink
                                      }));
                              }
                          }
                      },

                      pingCommand: {
                          command: 'ping',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat(alertBot.chat.pong)
                              }
                          }
                      },

                      refreshCommand: {
                          command: 'refresh',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  //sendToSocket();
                                  storeToStorage();
                                  alertBot.disconnectAPI();
                                  setTimeout(function() {
                                      window.location.reload(false);
                                  }, 1000);

                              }
                          }
                      },

                      reloadCommand: {
                          command: 'reload',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat(alertBot.chat.reload);
                                  //sendToSocket();
                                  storeToStorage();
                                  alertBot.disconnectAPI();
                                  kill();
                                  setTimeout(function() {
                                      $.getScript(alertBot.settings.scriptLink);
                                  }, 2000);
                              }
                          }
                      },

                      removeCommand: {
                          command: 'remove',
                          rank: 'mod',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length > cmd.length + 2) {
                                      var name = msg.substr(cmd.length + 2);
                                      var user = alertBot.userUtilities.lookupUserName(name);
                                      if (typeof user !== 'boolean') {
                                          user.lastDC = {
                                              time: null,
                                              position: null,
                                              songCount: 0
                                          };
                                          if (API.getDJ().id === user.id) {
                                              API.moderateForceSkip();
                                              setTimeout(function() {
                                                  API.moderateRemoveDJ(user.id);
                                              }, 1 * 1000, user);
                                          } else API.moderateRemoveDJ(user.id);
                                      } else API.sendChat(subChat(alertBot.chat.removenotinwl, {
                                          name: chat.un,
                                          username: name
                                      }));
                                  } else API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      restrictetaCommand: {
                          command: 'restricteta',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.etaRestriction) {
                                      alertBot.settings.etaRestriction = !alertBot.settings.etaRestriction;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.etarestriction
                                      }));
                                  } else {
                                      alertBot.settings.etaRestriction = !alertBot.settings.etaRestriction;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.etarestriction
                                      }));
                                  }
                              }
                          }
                      },

                      rouletteCommand: {
                          command: 'roulette',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (!alertBot.room.roulette.rouletteStatus) {
                                      alertBot.room.roulette.startRoulette();
                                  }
                              }
                          }
                      },

                      rulesCommand: {
                          command: 'rules',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (typeof alertBot.settings.rulesLink === 'string')
                                      return API.sendChat(subChat(alertBot.chat.roomrules, {
                                          link: alertBot.settings.rulesLink
                                      }));
                              }
                          }
                      },

                      sessionstatsCommand: {
                          command: 'sessionstats',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var from = chat.un;
                                  var woots = alertBot.room.roomstats.totalWoots;
                                  var mehs = alertBot.room.roomstats.totalMehs;
                                  var grabs = alertBot.room.roomstats.totalCurates;
                                  API.sendChat(subChat(alertBot.chat.sessionstats, {
                                      name: from,
                                      woots: woots,
                                      mehs: mehs,
                                      grabs: grabs
                                  }));
                              }
                          }
                      },

                      skipCommand: {
                          command: ['skip', 'smartskip'],
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.room.skippable) {

                                      var timeLeft = API.getTimeRemaining();
                                      var timeElapsed = API.getTimeElapsed();
                                      var dj = API.getDJ();
                                      var name = dj.username;
                                      var msgSend = '@' + name + ', ';

                                      if (chat.message.length === cmd.length) {
                                          API.sendChat(subChat(alertBot.chat.usedskip, {
                                              name: chat.un
                                          }));
                                          if (alertBot.settings.smartSkip && timeLeft > timeElapsed) {
                                              alertBot.roomUtilities.smartSkip();
                                          } else {
                                              API.moderateForceSkip();
                                          }
                                      }
                                      var validReason = false;
                                      var msg = chat.message;
                                      var reason = msg.substring(cmd.length + 1);
                                      for (var i = 0; i < alertBot.settings.skipReasons.length; i++) {
                                          var r = alertBot.settings.skipReasons[i][0];
                                          if (reason.indexOf(r) !== -1) {
                                              validReason = true;
                                              msgSend += alertBot.settings.skipReasons[i][1];
                                          }
                                      }
                                      if (validReason) {
                                          API.sendChat(subChat(alertBot.chat.usedskip, {
                                              name: chat.un
                                          }));
                                          if (alertBot.settings.smartSkip && timeLeft > timeElapsed) {
                                              alertBot.roomUtilities.smartSkip(msgSend);
                                          } else {
                                              API.moderateForceSkip();
                                              setTimeout(function() {
                                                  API.sendChat(msgSend);
                                              }, 500);
                                          }
                                      }
                                  }
                              }
                          }
                      },

                      skipposCommand: {
                          command: 'skippos',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var pos = msg.substring(cmd.length + 1);
                                  if (!isNaN(pos)) {
                                      alertBot.settings.skipPosition = pos;
                                      return API.sendChat(subChat(alertBot.chat.skippos, {
                                          name: chat.un,
                                          position: alertBot.settings.skipPosition
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.invalidpositionspecified, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      songstatsCommand: {
                          command: 'songstats',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.songstats) {
                                      alertBot.settings.songstats = !alertBot.settings.songstats;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.songstats
                                      }));
                                  } else {
                                      alertBot.settings.songstats = !alertBot.settings.songstats;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.songstats
                                      }));
                                  }
                              }
                          }
                      },

                      sourceCommand: {
                          command: 'source',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  API.sendChat('/me alertBot is an open-source bot for plug.dj. More info can be found here: https://github.com/alertBot/source');
                              }
                          }
                      },

                      statusCommand: {
                          command: 'status',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var from = chat.un;
                                  var msg = '[@' + from + '] ';

                                  msg += alertBot.chat.afkremoval + ': ';
                                  if (alertBot.settings.afkRemoval) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';
                                  msg += alertBot.chat.afksremoved + ': ' + alertBot.room.afkList.length + '. ';
                                  msg += alertBot.chat.afklimit + ': ' + alertBot.settings.maximumAfk + '. ';

                                  msg += 'Bouncer+: ';
                                  if (alertBot.settings.bouncerPlus) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.blacklist + ': ';
                                  if (alertBot.settings.blacklistEnabled) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.lockguard + ': ';
                                  if (alertBot.settings.lockGuard) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.cycleguard + ': ';
                                  if (alertBot.settings.cycleGuard) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.timeguard + ': ';
                                  if (alertBot.settings.timeGuard) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.chatfilter + ': ';
                                  if (alertBot.settings.filterChat) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.historyskip + ': ';
                                  if (alertBot.settings.historySkip) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.voteskip + ': ';
                                  if (alertBot.settings.voteSkip) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.cmddeletion + ': ';
                                  if (alertBot.settings.cmdDeletion) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  msg += alertBot.chat.autoskip + ': ';
                                  if (alertBot.settings.autoskip) msg += 'ON';
                                  else msg += 'OFF';
                                  msg += '. ';

                                  // TODO: Display more toggleable bot settings.

                                  var launchT = alertBot.room.roomstats.launchTime;
                                  var durationOnline = Date.now() - launchT;
                                  var since = alertBot.roomUtilities.msToStr(durationOnline);
                                  msg += subChat(alertBot.chat.activefor, {
                                      time: since
                                  });

                                  /*
                                  // least efficient way to go about this, but it works :)
                                  if (msg.length > 250){
                                      firstpart = msg.substr(0, 250);
                                      secondpart = msg.substr(250);
                                      API.sendChat(firstpart);
                                      setTimeout(function () {
                                          API.sendChat(secondpart);
                                      }, 300);
                                  }
                                  else {
                                      API.sendChat(msg);
                                  }
                                  */

                                  // This is a more efficient solution
                                  if (msg.length > 250) {
                                      var split = msg.match(/.{1,242}/g);
                                      for (var i = 0; i < split.length; i++) {
                                          var func = function(index) {
                                              setTimeout(function() {
                                                  API.sendChat('/me ' + split[index]);
                                              }, 500 * index);
                                          }
                                          func(i);
                                      }
                                  } else {
                                      return API.sendChat(msg);
                                  }
                              }
                          }
                      },

                      swapCommand: {
                          command: 'swap',
                          rank: 'mod',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var firstSpace = msg.indexOf(' ');
                                  var lastSpace = msg.lastIndexOf(' ');
                                  var name1 = msg.split('@')[1].trim();
                                  var name2 = msg.split('@')[2].trim();
                                  var user1 = alertBot.userUtilities.lookupUserName(name1);
                                  var user2 = alertBot.userUtilities.lookupUserName(name2);
                                  if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(alertBot.chat.swapinvalid, {
                                      name: chat.un
                                  }));
                                  if (user1.id === alertBot.loggedInID || user2.id === alertBot.loggedInID) return API.sendChat(subChat(alertBot.chat.addbottowaitlist, {
                                      name: chat.un
                                  }));
                                  var p1 = API.getWaitListPosition(user1.id) + 1;
                                  var p2 = API.getWaitListPosition(user2.id) + 1;
                                  if (p1 < 0 && p2 < 0) return API.sendChat(subChat(alertBot.chat.swapwlonly, {
                                      name: chat.un
                                  }));
                                  API.sendChat(subChat(alertBot.chat.swapping, {
                                      'name1': name1,
                                      'name2': name2
                                  }));
                                  if (p1 === -1) {
                                      API.moderateRemoveDJ(user2.id);
                                      setTimeout(function(user1, p2) {
                                          alertBot.userUtilities.moveUser(user1.id, p2, true);
                                      }, 2000, user1, p2);
                                  } else if (p2 === -1) {
                                      API.moderateRemoveDJ(user1.id);
                                      setTimeout(function(user2, p1) {
                                          alertBot.userUtilities.moveUser(user2.id, p1, true);
                                      }, 2000, user2, p1);
                                  } else if (p1 < p2) {
                                      alertBot.userUtilities.moveUser(user2.id, p1, false);
                                      setTimeout(function(user1, p2) {
                                          alertBot.userUtilities.moveUser(user1.id, p2, false);
                                      }, 2000, user1, p2);
                                  } else {
                                      alertBot.userUtilities.moveUser(user1.id, p2, false);
                                      setTimeout(function(user2, p1) {
                                          alertBot.userUtilities.moveUser(user2.id, p1, false);
                                      }, 2000, user2, p1);
                                  }
                              }
                          }
                      },

                      themeCommand: {
                          command: 'theme',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (typeof alertBot.settings.themeLink === 'string')
                                      API.sendChat(subChat(alertBot.chat.genres, {
                                          link: alertBot.settings.themeLink
                                      }));
                              }
                          }
                      },

                      thorCommand: {
                          command: 'thor',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.thorCommand) {
                                      var id = chat.uid,
                                          isDj = API.getDJ().id == id ? true : false,
                                          from = chat.un,
                                          djlist = API.getWaitList(),
                                          inDjList = false,
                                          oldTime = 0,
                                          usedThor = false,
                                          indexArrUsedThor,
                                          thorCd = false,
                                          timeInMinutes = 0,
          								pos = API.getWaitListPosition(chat.uid),
                                          worthyAlg = Math.floor(Math.random() * pos) + 1,
                                          worthy = worthyAlg == 1 ? true : false;

                                      // sly benzi 👀
                                      if (botCreatorIDs.indexOf(id) > -1) {
                                          worthy = true;
                                      }


                                      for (var i = 0; i < djlist.length; i++) {
                                          if (djlist[i].id == id)
                                              inDjList = true;
                                      }

                                      if (inDjList) {
                                          for (var i = 0; i < alertBot.room.usersUsedThor.length; i++) {
                                              if (alertBot.room.usersUsedThor[i].id == id) {
                                                  oldTime = alertBot.room.usersUsedThor[i].time;
                                                  usedThor = true;
                                                  indexArrUsedThor = i;
                                              }
                                          }

                                          if (usedThor) {
                                              timeInMinutes = (alertBot.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                              thorCd = timeInMinutes > 0 ? true : false;
                                              if (thorCd == false)
                                                  alertBot.room.usersUsedThor.splice(indexArrUsedThor, 1);
                                          }

                                          if (thorCd == false || usedThor == false) {
                                              var user = {
                                                  id: id,
                                                  time: Date.now()
                                              };
                                              alertBot.room.usersUsedThor.push(user);
                                          }
                                      }

                                      if (!inDjList) {
                                          return API.sendChat(subChat(alertBot.chat.thorNotClose, {
                                              name: from
                                          }));
                                      } else if (thorCd) {
                                          return API.sendChat(subChat(alertBot.chat.thorcd, {
                                              name: from,
                                              time: timeInMinutes
                                          }));
                                      }

                                      if (worthy) {
                                          if (API.getWaitListPosition(id) != 0)
                                              alertBot.userUtilities.moveUser(id, 1, false);
                                          API.sendChat(subChat(alertBot.chat.thorWorthy, {
                                              name: from
                                          }));
                                      } else {
                                          if (API.getWaitListPosition(id) != djlist.length - 1)
                                              alertBot.userUtilities.moveUser(id, djlist.length, false);
                                          API.sendChat(subChat(alertBot.chat.thorNotWorthy, {
                                              name: from
                                          }));
                                      }
                                  }
                              }
                          }
                      },

                      timeguardCommand: {
                          command: 'timeguard',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.timeGuard) {
                                      alertBot.settings.timeGuard = !alertBot.settings.timeGuard;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.timeguard
                                      }));
                                  } else {
                                      alertBot.settings.timeGuard = !alertBot.settings.timeGuard;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.timeguard
                                      }));
                                  }

                              }
                          }
                      },

                      toggleblCommand: {
                          command: 'togglebl',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var temp = alertBot.settings.blacklistEnabled;
                                  alertBot.settings.blacklistEnabled = !temp;
                                  if (alertBot.settings.blacklistEnabled) {
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.blacklist
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                      name: chat.un,
                                      'function': alertBot.chat.blacklist
                                  }));
                              }
                          }
                      },

                      togglemotdCommand: {
                          command: 'togglemotd',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.motdEnabled) {
                                      alertBot.settings.motdEnabled = !alertBot.settings.motdEnabled;
                                      API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.motd
                                      }));
                                  } else {
                                      alertBot.settings.motdEnabled = !alertBot.settings.motdEnabled;
                                      API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.motd
                                      }));
                                  }
                              }
                          }
                      },

                      togglevoteskipCommand: {
                          command: 'togglevoteskip',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.voteSkip) {
                                      alertBot.settings.voteSkip = !alertBot.settings.voteSkip;
                                      API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.voteskip
                                      }));
                                  } else {
                                      alertBot.settings.voteSkip = !alertBot.settings.voteSkip;
                                      API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.voteskip
                                      }));
                                  }
                              }
                          }
                      },

                      unbanCommand: {
                          command: 'unban',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  $.getJSON('/_/bans', function(json) {
                                      var msg = chat.message;
                                      if (msg.length === cmd.length) return;
                                      var name = msg.substring(cmd.length + 2);
                                      var bannedUsers = json.data;
                                      var found = false;
                                      var bannedUser = null;
                                      for (var i = 0; i < bannedUsers.length; i++) {
                                          var user = bannedUsers[i];
                                          if (user.username === name) {
                                              bannedUser = user;
                                              found = true;
                                          }
                                      }
                                      if (!found) return API.sendChat(subChat(alertBot.chat.notbanned, {
                                          name: chat.un
                                      }));
                                      API.moderateUnbanUser(bannedUser.id);
                                      console.log('Unbanned:', name);
                                  });
                              }
                          }
                      },

                      unlockCommand: {
                          command: 'unlock',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  alertBot.roomUtilities.booth.unlockBooth();
                              }
                          }
                      },

                      unmuteCommand: {
                          command: 'unmute',
                          rank: 'bouncer',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  $.getJSON('/_/mutes', function(json) {
                                      var msg = chat.message;
                                      if (msg.length === cmd.length) return;
                                      var name = msg.substring(cmd.length + 2);
                                      var arg = msg.substring(cmd.length + 1);
                                      var mutedUsers = json.data;
                                      var found = false;
                                      var mutedUser = null;
                                      var permFrom = alertBot.userUtilities.getPermission(chat.uid);
                                      if (msg.indexOf('@') === -1 && arg === 'all') {
                                          if (permFrom > API.ROLE.BOUNCER) {
                                              for (var i = 0; i < mutedUsers.length; i++) {
                                                  API.moderateUnmuteUser(mutedUsers[i].id);
                                              }
                                              API.sendChat(subChat(alertBot.chat.unmutedeveryone, {
                                                  name: chat.un
                                              }));
                                          } else API.sendChat(subChat(alertBot.chat.unmuteeveryonerank, {
                                              name: chat.un
                                          }));
                                      } else {
                                          for (var i = 0; i < mutedUsers.length; i++) {
                                              var user = mutedUsers[i];
                                              if (user.username === name) {
                                                  mutedUser = user;
                                                  found = true;
                                              }
                                          }
                                          if (!found) return API.sendChat(subChat(alertBot.chat.notbanned, {
                                              name: chat.un
                                          }));
                                          API.moderateUnmuteUser(mutedUser.id);
                                          console.log('Unmuted:', name);
                                      }
                                  });
                              }
                          }
                      },

                      uptimeCommand: {
                          command: 'uptime',
                          rank: 'bouncer',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var launchT = alertBot.room.roomstats.launchTime;
                                  var durationOnline = Date.now() - launchT;
                                  var since = alertBot.roomUtilities.msToStr(durationOnline);
                                  API.sendChat(subChat(alertBot.chat.activefor, {
                                      time: since
                                  }));
                              }
                          }
                      },

                      usercmdcdCommand: {
                          command: 'usercmdcd',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var cd = msg.substring(cmd.length + 1);
                                  if (!isNaN(cd)) {
                                      alertBot.settings.commandCooldown = cd;
                                      return API.sendChat(subChat(alertBot.chat.commandscd, {
                                          name: chat.un,
                                          time: alertBot.settings.commandCooldown
                                      }));
                                  } else return API.sendChat(subChat(alertBot.chat.invalidtime, {
                                      name: chat.un
                                  }));
                              }
                          }
                      },

                      usercommandsCommand: {
                          command: 'usercommands',
                          rank: 'manager',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.usercommandsEnabled) {
                                      API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.usercommands
                                      }));
                                      alertBot.settings.usercommandsEnabled = !alertBot.settings.usercommandsEnabled;
                                  } else {
                                      API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.usercommands
                                      }));
                                      alertBot.settings.usercommandsEnabled = !alertBot.settings.usercommandsEnabled;
                                  }
                              }
                          }
                      },

                      voteratioCommand: {
                          command: 'voteratio',
                          rank: 'residentdj',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length === cmd.length) return API.sendChat(subChat(alertBot.chat.nouserspecified, {
                                      name: chat.un
                                  }));
                                  var name = msg.substring(cmd.length + 2);
                                  var user = alertBot.userUtilities.lookupUserName(name);
                                  if (user === false) return API.sendChat(subChat(alertBot.chat.invaliduserspecified, {
                                      name: chat.un
                                  }));
                                  var vratio = user.votes;
                                  var ratio = vratio.woot / vratio.meh;
                                  API.sendChat(subChat(alertBot.chat.voteratio, {
                                      name: chat.un,
                                      username: name,
                                      woot: vratio.woot,
                                      mehs: vratio.meh,
                                      ratio: ratio.toFixed(2)
                                  }));
                              }
                          }
                      },

                      voteskipCommand: {
                          command: 'voteskip',
                          rank: 'manager',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  if (msg.length <= cmd.length + 1) return API.sendChat(subChat(alertBot.chat.voteskiplimit, {
                                      name: chat.un,
                                      limit: alertBot.settings.voteSkipLimit
                                  }));
                                  var argument = msg.substring(cmd.length + 1);
                                  if (!alertBot.settings.voteSkip) alertBot.settings.voteSkip = !alertBot.settings.voteSkip;
                                  if (isNaN(argument)) {
                                      API.sendChat(subChat(alertBot.chat.voteskipinvalidlimit, {
                                          name: chat.un
                                      }));
                                  } else {
                                      alertBot.settings.voteSkipLimit = argument;
                                      API.sendChat(subChat(alertBot.chat.voteskipsetlimit, {
                                          name: chat.un,
                                          limit: alertBot.settings.voteSkipLimit
                                      }));
                                  }
                              }
                          }
                      },

                      welcomeCommand: {
                          command: 'welcome',
                          rank: 'mod',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (alertBot.settings.welcome) {
                                      alertBot.settings.welcome = !alertBot.settings.welcome;
                                      return API.sendChat(subChat(alertBot.chat.toggleoff, {
                                          name: chat.un,
                                          'function': alertBot.chat.welcomemsg
                                      }));
                                  } else {
                                      alertBot.settings.welcome = !alertBot.settings.welcome;
                                      return API.sendChat(subChat(alertBot.chat.toggleon, {
                                          name: chat.un,
                                          'function': alertBot.chat.welcomemsg
                                      }));
                                  }
                              }
                          }
                      },

                      whoisCommand: {
                          command: 'whois',
                          rank: 'residentdj',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  var msg = chat.message;
                                  var name;
                                  if (msg.length === cmd.length) name = chat.un;
                                  else {
                                      name = msg.substr(cmd.length + 2);
                                  }
                                  users = API.getUsers();
                                  var len = users.length;
                                  for (var i = 0; i < len; ++i) {
                                      if (users[i].username == name) {

                                          var id = users[i].id;
                                          var avatar = API.getUser(id).avatarID;
                                          var level = API.getUser(id).level;
                                          var rawjoined = API.getUser(id).joined;
                                          var joined = rawjoined.substr(0, 10);
                                          var rawlang = API.getUser(id).language;

                                          if (rawlang == 'en') {
                                              var language = 'English';
                                          } else if (rawlang == 'bg') {
                                              var language = 'Bulgarian';
                                          } else if (rawlang == 'cs') {
                                              var language = 'Czech';
                                          } else if (rawlang == 'fi') {
                                              var language = 'Finnish';
                                          } else if (rawlang == 'fr') {
                                              var language = 'French';
                                          } else if (rawlang == 'pt') {
                                              var language = 'Portuguese';
                                          } else if (rawlang == 'zh') {
                                              var language = 'Chinese';
                                          } else if (rawlang == 'sk') {
                                              var language = 'Slovak';
                                          } else if (rawlang == 'nl') {
                                              var language = 'Dutch';
                                          } else if (rawlang == 'ms') {
                                              var language = 'Malay';
                                          }

                                          var rawrank = API.getUser(id);

                                          if (rawrank.role == API.ROLE.NONE) {
                                              var rank = 'User';
                                          } else if (rawrank.role == API.ROLE.DJ) {
                                              var rank = 'Resident DJ';
                                          } else if (rawrank.role == API.ROLE.BOUNCER) {
                                              var rank = 'Bouncer';
                                          } else if (rawrank.role == API.ROLE.MANAGER) {
                                              var rank = 'Manager';
                                          } else if (rawrank.role == API.ROLE.COHOST) {
                                              var rank = 'Co-Host';
                                          } else if (rawrank.role == API.ROLE.HOST) {
                                              var rank = 'Host';
                                          }

                                          if (rawrank.gRole == 3000) {
                                              var rank = 'Brand Ambassador';
                                          } else if (rawrank.gRole == 5000) {
                                              var rank = 'Admin';
                                          }

                                          var slug = API.getUser(id).slug;
                                          if (typeof slug !== 'undefined') {
                                              var profile = 'https://plug.dj/@/' + slug;
                                          } else {
                                              var profile = '~';
                                          }

                                          API.sendChat(subChat(alertBot.chat.whois, {
                                              name1: chat.un,
                                              name2: name,
                                              id: id,
                                              avatar: avatar,
                                              profile: profile,
                                              language: language,
                                              level: level,
                                              joined: joined,
                                              rank: rank
                                          }));
                                      }
                                  }
                              }
                          }
                      },

                      youtubeCommand: {
                          command: 'youtube',
                          rank: 'user',
                          type: 'exact',
                          functionality: function(chat, cmd) {
                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                              else {
                                  if (typeof alertBot.settings.youtubeLink === 'string')
                                      API.sendChat(subChat(alertBot.chat.youtube, {
                                          name: chat.un,
                                          link: alertBot.settings.youtubeLink
                                      }));
                              }
                          }
                      }

      }
    };

    loadChat(alertBot.startup);
}).call(this);
