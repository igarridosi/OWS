import React, { useEffect, useState } from 'react';
import { getUserFromToken } from '../utils/helpers';
import api, {
  getJoinedCountries,
  deleteCountry,
  editCountry,
  deleteChannel,
  editChannel,
  deleteMessage,
  getCountryUsers,
  blockUser,
  unblockUser,
  getAllCommunityUsers,
  leaveCountry, // <-- add this import
  getCommunitySpotInbox,
  approveCommunitySpotInbox,
  rejectCommunitySpotInbox
} from '../services/backendApiService';
import EmojiPicker from 'emoji-picker-react';

//React Icons
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { RxExit } from "react-icons/rx";
import { MdEmail } from "react-icons/md";
import { MdInfoOutline } from "react-icons/md";

function CommunityPage({ user: userProp }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [newCountry, setNewCountry] = useState({ name: '', flagEmoji: '' });
  const [newChannel, setNewChannel] = useState('');
  const [joinedCountries, setJoinedCountries] = useState([]);
  const [joinMessage, setJoinMessage] = useState('');
  const user = userProp || getUserFromToken();

  // Admin: Editing state
  const [editingCountryId, setEditingCountryId] = useState(null);
  const [editingCountryName, setEditingCountryName] = useState('');
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [editingChannelName, setEditingChannelName] = useState('');
  // Admin: User block state
  const [countryUsers, setCountryUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserBlockPanel, setShowUserBlockPanel] = useState(false);
  // Admin: Show only blocked users in the user block panel
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showInbox, setShowInbox] = useState(false);
  const [inboxSpots, setInboxSpots] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');

  useEffect(() => {
    api.get('/community/countries')
      .then(res => setCountries(res.data))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setSelectedChannel(null);
      setMessages([]);
      return;
    }
    api.get(`/community/countries/${selectedCountry.id}/channels`)
      .then(res => setChannels(res.data))
      .catch(() => setChannels([]));
    setSelectedChannel(null);
    setMessages([]);
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedChannel) return;
    setLoading(true);
    api.get(`/community/channels/${selectedChannel.id}/messages`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedChannel]);

  // Fetch joined countries when user is known
  useEffect(() => {
    if (!user) return;
    getJoinedCountries().then(setJoinedCountries).catch(() => setJoinedCountries([]));
  }, [user]);

  // Fetch users for block panel
  useEffect(() => {
    if (adminMode && selectedCountry && user?.role === 'admin') {
      getCountryUsers(selectedCountry.id).then(setCountryUsers).catch(() => setCountryUsers([]));
    }
    if (adminMode && user?.role === 'admin') {
      getAllCommunityUsers().then(setAllUsers).catch(() => setAllUsers([]));
    }
  }, [adminMode, selectedCountry, user]);

  const fetchInboxSpots = async () => {
    setInboxLoading(true);
    setInboxError('');
    try {
      const spots = await getCommunitySpotInbox();
      setInboxSpots(spots);
    } catch (err) {
      setInboxError('Failed to load pending spots.');
    } finally {
      setInboxLoading(false);
    }
  };

  const handleApproveSpot = async (id) => {
    await approveCommunitySpotInbox(id);
    setInboxSpots(inboxSpots.filter(s => s.id !== id));
  };
  const handleRejectSpot = async (id) => {
    await rejectCommunitySpotInbox(id);
    setInboxSpots(inboxSpots.filter(s => s.id !== id));
  };

  const handleJoinCountry = async (country) => {
    if (!user) return;
    try {
      await api.post(`/community/countries/${country.id}/join`);
      // Refresh joined countries and countries list after joining
      getJoinedCountries().then(setJoinedCountries).catch(() => setJoinedCountries([]));
      api.get('/community/countries').then(res => setCountries(res.data)).catch(() => {});
      setSelectedCountry(country);
      // Fetch channels for the joined country
      api.get(`/community/countries/${country.id}/channels`).then(res => setChannels(res.data)).catch(() => setChannels([]));
      setJoinMessage('You joined the community!');
      setTimeout(() => setJoinMessage(''), 2500);
    } catch {
      setError('Failed to join country');
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!user || !messageInput.trim() || !selectedChannel) return;
    try {
      const res = await api.post(`/community/channels/${selectedChannel.id}/messages`, { content: messageInput });
      setMessages([...messages, res.data]);
      setMessageInput('');
    } catch {
      setError('Failed to post message');
    }
  };

  const handleCreateCountry = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;
    try {
      await api.post('/community/countries', newCountry);
      setNewCountry({ name: '', flagEmoji: '' });
      const res = await api.get('/community/countries');
      setCountries(res.data);
    } catch {
      setError('Failed to create country');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'admin' || !selectedCountry) return;
    try {
      await api.post(`/community/countries/${selectedCountry.id}/channels`, { name: newChannel });
      setNewChannel('');
      const res = await api.get(`/community/countries/${selectedCountry.id}/channels`);
      setChannels(res.data);
    } catch {
      setError('Failed to create channel');
    }
  };

  const handleToggleAdminMode = () => setAdminMode(m => !m);

  // Admin: Delete country
  const handleDeleteCountry = async (countryId) => {
    if (!window.confirm('Delete this community?')) return;
    await deleteCountry(countryId);
    setCountries(countries.filter(c => c.id !== countryId));
    setSelectedCountry(null);
  };
  // Admin: Edit country
  const handleEditCountry = async (countryId) => {
    await editCountry(countryId, { name: editingCountryName });
    setCountries(countries.map(c => c.id === countryId ? { ...c, name: editingCountryName } : c));
    setEditingCountryId(null);
    setEditingCountryName('');
  };
  // Admin: Delete channel
  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm('Delete this channel?')) return;
    await deleteChannel(selectedCountry.id, channelId);
    setChannels(channels.filter(ch => ch.id !== channelId));
    setSelectedChannel(null);
  };
  // Admin: Edit channel
  const handleEditChannel = async (channelId) => {
    await editChannel(selectedCountry.id, channelId, { name: editingChannelName });
    setChannels(channels.map(ch => ch.id === channelId ? { ...ch, name: editingChannelName } : ch));
    setEditingChannelId(null);
    setEditingChannelName('');
  };
  // Admin: Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    await deleteMessage(selectedChannel.id, messageId);
    setMessages(messages.filter(m => m.id !== messageId));
  };
  // Admin: Block/unblock user (with confirmation)
  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user? They will lose access to the community.')) return;
    await blockUser(userId);
    setCountryUsers(countryUsers.map(u => u.id === userId ? { ...u, blocked: true } : u));
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, blocked: true } : u));
  };
  const handleUnblockUser = async (userId) => {
    await unblockUser(userId);
    setCountryUsers(countryUsers.map(u => u.id === userId ? { ...u, blocked: false } : u));
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, blocked: false } : u));
  };

  // Blocked user: show blocked message and prevent access (robust check)
  if (user && (user.blocked === true || user.blocked === 'true')) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🌍OWS Communities</h1>
        <div className="bg-red-100 border-l-4 border-red-500 p-5 rounded-lg mb-6 shadow text-red-800 font-semibold">
          Your access to the community has been blocked for violating the rules. If you believe this is a mistake, please contact support.
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🌍OWS Communities</h1>
        <div className="bg-red-100 border-l-4 border-red-500 p-5 rounded-lg mb-6 shadow text-red-800 font-semibold">
          You must be logged in to access the community. Please log in or sign up to join and participate in community groups.
        </div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🌍OWS Communities</h1>

      {user?.role === 'admin' && (
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${adminMode ? 'bg-red-600 hover:bg-red-700 text-white ' : 'bg-darkblue hover:bg-[#26a224d7]  text-white'}`}
            onClick={handleToggleAdminMode}
          >
            {adminMode ? 'Exit Moderation Mode' : 'Moderate Communities'}
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium bg-accent text-white hover:bg-darkblue transition"
            onClick={() => { setShowInbox(true); fetchInboxSpots(); }}
          >
            Inbox ({inboxSpots.length})
          </button>
        </div>
      )}
      {/* Admin Inbox Modal */}
      {showInbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center rounded-3xl bg-[#364153cf]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-h-[50vh] m-4 md:m-0 w-full max-w-2xl overflow-hidden relative flex flex-col">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-darkblue text-2xl font-bold"
              onClick={() => setShowInbox(false)}
            >×</button>
            <h2 className="text-2xl font-bold mb-4 text-darkblue">Pending Community Spots</h2>
            {inboxLoading ? (
              <div>Loading...</div>
            ) : inboxError ? (
              <div className="text-red-600">{inboxError}</div>
            ) : inboxSpots.length === 0 ? (
              <div className="text-gray-500">No pending spots.</div>
            ) : (
              <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                {inboxSpots.map(spot => (
                  <li key={spot.id} className="bg-gray-100 rounded-xl p-4 flex flex-col gap-2 shadow">
                    <div className="font-bold text-lg text-darkblue">{spot.name}</div>
                    <div className="font-normal text-md text-darkblue">Subbmited by user ID: {spot.submittedBy}</div>
                    <div className="text-gray-700 italic text-sm">
                      {spot.description ? spot.description : 'No description available.'}
                    </div>
                    <div className="flex flex-row items-center">
                      <p className='text-md text-gray-500'>Lat: {spot.lat} | Lon: {spot.lng}</p>
                      <a
                        className="text-xs text-center bg-darkblue text-white no-underline rounded px-2 py-1 hover:bg-[#364153cf] transition ml-4"
                        href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Maps ⌕
                      </a>
                    </div>
                    {spot.imageUrl && <img src={spot.imageUrl} alt={spot.name} className="w-32 h-32 object-cover rounded-lg border" />}
                    <div className="flex gap-2 mt-2">
                      <button className="px-4 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-700" onClick={() => handleApproveSpot(spot.id)}>Approve</button>
                      <button className="px-4 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700" onClick={() => handleRejectSpot(spot.id)}>Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {adminMode && (
        <div className="bg-[#aeb0b4a6] border-l-4 border-darkblue p-5 rounded-lg mb-6 shadow">
          <h2 className="text-xl font-bold text-darkblue mb-2">🛠 Admin Moderation Panel</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 list-disc list-inside space-y-1 space-x-4 text-darkblue">
            {countries.map((country) => (
              <li key={country.id} className="flex items-center bg-white gap-2 border-l-4 rounded-lg border-b-4 font-bold border-darkblue mb-2 mt-4 p-2">
                
                {editingCountryId === country.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1"
                      value={editingCountryName}
                      onChange={e => setEditingCountryName(e.target.value)}
                    />
                    <button className="text-accent cursor-pointer font-bold" onClick={() => handleEditCountry(country.id)}>Save</button>
                    <button className="text-darkblue cursor-pointer" onClick={() => setEditingCountryId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {country.name}
                      <button className="text-md py-1 px-4 rounded-full text-darkblue cursor-pointer hover:scale-115 transition " onClick={() => { setEditingCountryId(country.id); setEditingCountryName(country.name); }}><CiEdit className='size-7'/></button>
                      <button className="text-red-600 cursor-pointer hover:scale-115 transition " onClick={() => handleDeleteCountry(country.id)}><MdDeleteForever className='size-7'/></button>
                  </>
                )}
              </li>
            ))}
          </ul>
          {/* User Management Button */}
          <button className="mt-4 px-4 py-2 bg-darkblue text-white border-l-4 rounded-lg border-b-4 border-white " onClick={() => setShowUserBlockPanel(v => !v)}>
            {showUserBlockPanel ? 'Hide User Management' : 'User Management'}
          </button>

          {/* User Management Modal */}
          {showUserBlockPanel && (
            <div className="fixed inset-0 z-50 flex items-start rounded-3xl justify-center bg-[#364153e3]">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative top-1/6">
                <button
                  className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-red-500"
                  onClick={() => setShowUserBlockPanel(false)}
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4">User Management</h2>
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-3 py-1 rounded ${!showBlockedUsers ? 'bg-accent text-white' : 'bg-gray-200'}`}
                    onClick={() => setShowBlockedUsers(false)}
                  >
                    All Users
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${showBlockedUsers ? 'bg-accent text-white' : 'bg-gray-200'}`}
                    onClick={() => setShowBlockedUsers(true)}
                  >
                    Blocked Users
                  </button>
                </div>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {(showBlockedUsers
                    ? (selectedCountry ? countryUsers : allUsers).filter(u => u.blocked)
                    : (selectedCountry ? countryUsers : allUsers)
                  ).map(u => (
                    <li key={u.id} className="flex justify-between items-center border-b py-2">
                      <div>
                        <span className="font-semibold">{u.name || u.email}</span>
                        {u.blocked && <span className="ml-2 text-red-500 text-xs">(Blocked)</span>}
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                      {u.blocked ? (
                        <button
                          className="text-green-600 hover:underline cursor-pointer"
                          onClick={() => handleUnblockUser(u.id)}
                        >
                          Unblock
                        </button>
                      ) : (
                        !showBlockedUsers && (
                          <button
                            className="text-red-600 hover:underline cursor-pointer"
                            onClick={() => handleBlockUser(u.id)}
                          >
                            Block
                          </button>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
        </div>
      )}

      {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

      {user && joinedCountries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-darkblue mb-2">Communities you’ve joined</h2>
          <div className="flex flex-wrap gap-2">
            {joinedCountries.map(country => (
              <span key={country.id} className="px-3 py-1 rounded-full bg-green-100 text-accent border border-accent text-sm font-semibold flex items-center gap-1">
                {country.flagEmoji} {country.name}
                <button
                  className="px-2 py-0.5 rounded text-red-700 text-md font-normal hover:text-darkblue transition cursor-pointer"
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to leave ${country.name}?`)) {
                      await leaveCountry(country.id);
                      getJoinedCountries().then(setJoinedCountries).catch(() => setJoinedCountries([]));
                      // Optionally, reset selected country if left
                      if (selectedCountry && selectedCountry.id === country.id) setSelectedCountry(null);
                    }
                  }}
                  title={`Leave ${country.name}`}
                >
                  <RxExit />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Joined Communities List */}
      {joinMessage && (
        <div className="mb-4 p-3 rounded-lg bg-white text-darkblue font-bold text-center border-2 border-darkblue animate-fade-in-up">
          {joinMessage}
        </div>
      )}

      {/* Country Selection */}
      <div className="mb-8">
        <div className='flex items-center gap-2 mb-4'>
          <h2 className="text-2xl font-bold text-gray-700">Select a Country</h2>
          <div className="relative flex items-center group">
            <div className="relative flex items-center group">
              <MdInfoOutline className="text-xl text-darkblue cursor-pointer ml-2" />
            </div>
            {/* Wrap the tooltip in a container that stays hoverable */}
            <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-white border border-gray-300 shadow-lg p-4 text-sm text-gray-700 font-semibold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              If you want to add a new <b className='font-bold'>Country Community</b>, please contact us here: <br />
              <a
                href="mailto:openworkoutspots@gmail.com"
                className="text-darkblue font-bold hover:text-accent hover:underline flex items-center mt-2"
              >
                <MdEmail className="mr-2" />
                openworkoutspots@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {countries.map((country) => {
            const isJoined = joinedCountries.some(jc => jc.id === country.id);
            return (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-sm transition ${selectedCountry?.id === country.id ? 'bg-darkblue font-bold text-white' : isJoined ? 'bg-green-200  text-darkblue border-green-300' : 'bg-white  text-gray-800 hover:bg-gray-50'}`}
              >
                <span className="text-lg flex items-center gap-2">{country.flagEmoji} {country.name} <span className="text-xs font-semibold text-darkblue"> {country.memberCount} members</span></span>
                {user && !isJoined && (
                  <button
                    className="text-md ml-2 py-1 px-4 bg-accent rounded-xl text-white cursor-pointer hover:scale-105 hover:bg-darkblue transition "
                    onClick={(e) => { e.stopPropagation(); handleJoinCountry(country); }}
                  >
                    Join
                  </button>
                )}
                {user && isJoined && (
                  <span className="ml-2 text-md font-bold text-darkblue rounded-xl px-2 py-1 bg-white">Joined</span>
                )}
              </button>
            );
          })}
        </div>

        {user?.role === 'admin' && adminMode && (
          <form onSubmit={handleCreateCountry} className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="Country Name"
              className="border rounded px-3 py-2 flex-1"
              value={newCountry.name}
              onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
              required
            />
            {/* Emoji Picker */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="text-2xl border rounded px-2 py-1 bg-white"
                onClick={() => setShowEmojiPicker((v) => !v)}
                title="Pick a flag emoji"
              >
                {newCountry.flagEmoji || '🚩'}
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-44 right-10 md:bottom-3 md:right-62 z-50 border-2 border-darkblue rounded-lg">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setNewCountry({ ...newCountry, flagEmoji: emojiData.emoji });
                      setShowEmojiPicker(false);
                    }}
                    height={400}
                    width={300}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="bg-darkblue text-white px-4 py-2 rounded hover:bg-[#364153d7]">
              Add Community
            </button>
          </form>
        )}
      </div>

      {/* Channel Selection */}
      {selectedCountry && (
        <div className="mb-8">
          <div className='flex items-center gap-2 mb-4'>
            <h2 className="text-xl font-bold text-gray-700">
              Channels in {selectedCountry.name}
            </h2>
            <div className="relative flex items-center group">
              <div className="relative flex items-center group">
                <MdInfoOutline className="text-xl text-darkblue cursor-pointer ml-2" />
              </div>
              {/* Wrap the tooltip in a container that stays hoverable */}
              <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-white border border-gray-300 shadow-lg p-4 text-sm text-gray-700 font-semibold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                If you want to add a new <b className='font-bold underline'>Channel</b> for this Community, please contact us here:<br />
                <a
                  href="mailto:openworkoutspots@gmail.com"
                  className="text-darkblue font-bold hover:text-accent hover:underline flex items-center mt-2"
                >
                  <MdEmail className="mr-2"/>
                  openworkoutspots@gmail.com
                </a>
              </div>
            </div>
          </div>
          {(joinedCountries.some(jc => jc.id === selectedCountry.id) || adminMode) ? (
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center gap-2">
                  <button
                    className={`px-5 py-2 rounded-full cursor-pointer transition font-bold border-2 text-lg ${selectedChannel?.id === channel.id ? 'bg-white text-darkblue' : 'bg-[#ffffff5b] hover:bg-gray-300 text-gray-700'}`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    {editingChannelId === channel.id ? (
                      <>
                        <input
                          className="border rounded px-2 py-1"
                          value={editingChannelName}
                          onChange={e => setEditingChannelName(e.target.value)}
                        />
                        <button className="text-accent font-bold ml-2 cursor-pointer" onClick={e => { e.stopPropagation(); handleEditChannel(channel.id); }}>Save</button>
                        <button className="text-darkblue font-bold ml-2 cursor-pointer" onClick={e => { e.stopPropagation(); setEditingChannelId(null); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {channel.name}
                        {adminMode && (
                          <>
                            <button className="text-blue-700 ml-2 cursor-pointer" onClick={e => { e.stopPropagation(); setEditingChannelId(channel.id); setEditingChannelName(channel.name); }}>Edit</button>
                            <button className="text-red-700 ml-2 cursor-pointer" onClick={e => { e.stopPropagation(); handleDeleteChannel(channel.id); }}>Delete</button>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="blur-sm pointer-events-none select-none flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    className="px-5 py-2 rounded-full cursor-not-allowed transition font-bold border-2 text-lg bg-gray-200 text-gray-400"
                  >
                    {channel.name}
                  </button>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white/90 rounded-xl mt-15 p-2 md:mt-10 md:p-4 border-2 border-darkblue shadow text-darkblue font-bold text-center">
                  You must join this community to view and participate in its channels.
                </div>
              </div>
            </div>
          )}
          {user?.role === 'admin' && adminMode &&(
            <form onSubmit={handleCreateChannel} className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Channel Name"
                className="border rounded px-3 py-2 flex-1"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                required
              />
              <button type="submit" className="bg-darkblue text-white px-4 py-2 rounded hover:bg-[#364153d7]">
                Add Channel
              </button>
            </form>
          )}
        </div>
      )}

      {/* Messages Section */}
      {selectedChannel && (
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-3">
            Messages in {selectedChannel.name}
          </h2>
          <div className="bg-white rounded-lg border-b-4 items-end justify-end border-darkblue border-l-4 p-4 max-h-70 overflow-y-auto space-y-3 shadow">
            {loading ? (
              <div>Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-gray-500">No messages yet.</div>
            ) : (
              messages
                .filter(msg => {
                  // Hide messages from blocked users
                  if (!msg.userId) return true;
                  const blockedUser = countryUsers.find(u => u.id === msg.userId && u.blocked) || allUsers.find(u => u.id === msg.userId && u.blocked);
                  return !blockedUser;
                })
                .map((msg, i) => (
                  <div key={msg.id || i} className="bg-[#26a22438] text-gray-800 p-3 rounded-3xl flex justify-between rounded-bl-none shadow max-w-xs">
                    <div>
                      <p className="text-xs text-gray-700 font-bold mb-1">{msg.userName || 'OWS User'}</p>
                      <p className='text-lg'>{msg.content}</p>
                    </div>
                    {adminMode && msg.userId && !countryUsers.find(u => u.id === msg.userId && u.blocked) && (
                      <div className="flex flex-row items-start gap-2">
                        <button className="text-red-700 ml-4" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                        <button className="text-orange-700 ml-4" onClick={() => handleBlockUser(msg.userId)}>Block User</button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
          {user && (
            <form onSubmit={handlePostMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="rounded-lg border-2 border-darkblue flex-1 px-3 py-2"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                required
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default CommunityPage;
