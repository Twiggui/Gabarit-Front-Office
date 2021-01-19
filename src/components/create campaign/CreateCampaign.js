import {
  InputLabel,
  NativeSelect,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

import React, { useContext, useEffect, useState } from 'react';
import { GrCloudDownload } from 'react-icons/gr';
import { FaMicrophone } from 'react-icons/fa';
import { IoIosPlayCircle } from 'react-icons/io';
import { FiPhoneIncoming } from 'react-icons/fi';
import { ImFolderDownload } from 'react-icons/im';
import { AiOutlineImport, AiOutlineExport } from 'react-icons/ai';
import { MdPermContactCalendar } from 'react-icons/md';
import './CreateCampaign.scss';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import API from '../../services/API';
import textToSpeechIcon from '../../images/text_to_speech.png';
import {
  SpeedSlider,
  PitchSlider,
  VolumeSlider,
} from './subcomponents/CustomizedSlider';
import { UserContext } from '../../context/UserContext';
import ContactsView from './subcomponents/ContactsView';

const CreateCampaign = () => {
  const [messageToVocalize, setMessageToVocalize] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
  const [downloadAudioFilePath, setDownloadAudioFilePath] = useState('');
  const [textToUpload, setTextToUpload] = useState('');
  const [fileNameTextToUpload, setFileNameTextToUpload] = useState('');
  const [audioConfig, setAudioConfig] = useState({});
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberTestCheck, setPhoneNumberTestCheck] = useState(false);
  const [vocalisationFileName, setVocalisationFileName] = useState('');
  const [audioDuration, setAudioDuration] = useState();
  const [messageCounter, setMessageCounter] = useState(1);

  const { userDetails } = useContext(UserContext);

  const handleChange = (e) => {
    setMessageToVocalize(e.target.value);
  };

  const submitTextToUpload = () => {
    const formData = new FormData();
    formData.append('uploaded_text', textToUpload);
    API.post(`/users/${userDetails.id}/campaigns/uploadtext`, formData)
      .then((res) => {
        setMessageToVocalize(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (textToUpload) {
      submitTextToUpload();
    }
  }, [textToUpload]);

  const handleSliderAudioConfig = (name) => (e, value) => {
    setAudioConfig((prevConfig) => {
      return { ...prevConfig, [name]: value };
    });
  };
  const handleSelectAudioConfig = (e) => {
    setAudioConfig((prevConfig) => {
      return { ...prevConfig, [e.target.name]: e.target.value };
    });
  };

  const sendToGTTS = () => {
    API.post(`/users/${userDetails.id}/campaigns/TTS`, {
      message: messageToVocalize,
      audioConfig,
    })
      .then((res) => {
        setVocalisationFileName(res.data);
        setAudioFilePath(
          `${process.env.REACT_APP_API_BASE_URL}/users/${userDetails.id}/campaigns/audio?audio=${res.data}`
        );
        setDownloadAudioFilePath(
          `${process.env.REACT_APP_API_BASE_URL}/users/${userDetails.id}/campaigns/downloadaudio?audio=${res.data}`
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const playAudioTest = () => {
    // ES lint should be disabled for Safari compatibility
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio id="audioPlayer" src={audioFilePath} />;
  };

  const handleFileUpload = (e) => {
    setTextToUpload(e.target.files[0]);
    if (e.target.files[0]) {
      setFileNameTextToUpload(e.target.files[0].name);
    } else {
      setFileNameTextToUpload('');
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePhoneNumber = (e) => {
    setPhoneNumber(e);
  };

  const handleCancelPhoneNumber = () => {
    setPhoneNumber('');
  };

  const sendVocalMessage = async () => {
    if (phoneNumber === '') {
      setPhoneNumberTestCheck(false);
    } else {
      setPhoneNumberTestCheck(true);
      // loaderON A RAJOUTER
      // setPhoneNumber('Message envoyé') A RAJOUTER;

      await API.post('/voice/sendVocalMessage/test', {
        phoneNumber,
        vocalisationFileName,
      });
      // LoaderOFF A RAJOUTER
    }
  };

  const audio = document.getElementById('audioPlayer');

  const play = () => {
    setAudioDuration();
    audio.play();

    audio.addEventListener('timeupdate', () => {
      if (!Number.isNaN(audio.duration) && audio.duration !== Infinity) {
        const duration = Math.round(audio.duration * 100) / 100;
        setAudioDuration(`${duration} s`);
      }
    });
  };

  const getMessageCounter = (message) => {
    if (message.length > 160) {
      const length = Math.floor(message.length / 160) + 1;
      setMessageCounter(length);
    }
  };

  useEffect(() => {
    if (messageToVocalize) {
      getMessageCounter(messageToVocalize);
    }
  }, [messageToVocalize]);

  return (
    <div className="create-campaign-body">
      <div className="title-page">
        <img src={textToSpeechIcon} alt="push vocal icon" />
        <h2 className="title-page-title">PUSH VOCAL</h2>
        <p> : élargir votre audience en envoyant des messages vocaux </p>
      </div>

      <div className="vocal-campaign-body">
        <h3 className="vocal-campaign-title">Campagne de diffusion</h3>
        <div className="vocal-campaign-frame">
          <div className="vocal-campaign-grid">
            <p>Nom de campagne</p>
            <NativeSelect className="vocal-campaign-name" id="select">
              <option value="10">Mon nom de campagne</option>
              <option value="20">Une autre campagne</option>
            </NativeSelect>
            <p>Date d'envoi</p>
            <form className="vocal-campaign-date" noValidate>
              <TextField
                id="datetime-local"
                type="datetime-local"
                defaultValue="2017-05-24T10:30"
                className="textField"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </form>
          </div>
        </div>
      </div>

      <div className="vocalization-body">
        <h3 className="vocalization-title">
          Saisissez votre message à vocaliser (160 caractères maximum)
        </h3>
        <div className="vocalization-frame">
          <form>
            <div className="text-download">
              <label htmlFor="textToUpload">
                <div className="flexForm">
                  <GrCloudDownload className="download-icon" />
                  <p
                    className={
                      !fileNameTextToUpload
                        ? 'fileNotYetUploaded'
                        : 'fileUploaded'
                    }
                  >
                    {!fileNameTextToUpload
                      ? 'Importer un message'
                      : fileNameTextToUpload}
                    <br />
                    <em className={!fileNameTextToUpload ? '' : 'hidden'}>
                      (formats acceptés : .txt, .docx)
                    </em>
                  </p>
                </div>
                <input
                  id="textToUpload"
                  type="file"
                  accept=".txt, .docx"
                  hidden
                  onChange={(e) => {
                    handleFileUpload(e);
                  }}
                />
              </label>
            </div>
            <textarea
              className="text-to-vocalize"
              placeholder="Ecrivez votre message à vocaliser ici..."
              value={messageToVocalize}
              onChange={handleChange}
            />
          </form>
          <p
            className={
              messageToVocalize.length > 160
                ? 'warning-message-active'
                : 'warning-message'
            }
          >
            {messageToVocalize.length}/160 caractères.{' '}
            {messageCounter > 1 &&
              `Ce message vous sera facturé l'équivalent de ${messageCounter} messages.`}
          </p>
        </div>
      </div>

      <div className="option-vocalization-body">
        <h3 className="option-vocalization-title">Options de vocalisation</h3>
        <div className="option-vocalization-frame">
          <div className="option-vocalization-grid">
            <p>Type de voix</p>
            <div className="option-vocalization-type">
              <InputLabel htmlFor="select" />
              <NativeSelect
                id="select"
                name="voiceGender"
                onChange={(e) => handleSelectAudioConfig(e)}
              >
                <option value="A">Femme 1</option>
                <option value="B">Homme 1</option>
                <option value="C">Femme 2</option>
                <option value="D">Homme 2</option>
                <option value="E">Femme 3</option>
              </NativeSelect>
            </div>
            <p>Vitesse de la voix</p>

            <SpeedSlider handleSliderAudioConfig={handleSliderAudioConfig} />
            <p>Réalisme de la voix</p>
            <div className="option-vocalization-realism">
              <InputLabel htmlFor="select" />
              <NativeSelect
                id="select"
                name="voiceType"
                onChange={(e) => handleSelectAudioConfig(e)}
              >
                <option value="Standard">Standard</option>
                <option value="WaveNet">Réaliste</option>
              </NativeSelect>
            </div>

            <p>Hauteur de la voix</p>
            <PitchSlider handleSliderAudioConfig={handleSliderAudioConfig} />

            <p>Format du fichier audio</p>
            <div className="option-vocalization-realism">
              <InputLabel htmlFor="select" />
              <NativeSelect
                id="select"
                name="audioEncoding"
                onChange={(e) => handleSelectAudioConfig(e)}
              >
                <option value="MP3">mp3</option>
                <option value="LINEAR16">wav</option>
              </NativeSelect>
            </div>

            <p>Volume de la voix</p>
            <VolumeSlider handleSliderAudioConfig={handleSliderAudioConfig} />
          </div>

          {audioConfig.voiceType === 'WaveNet' && (
            <p className="alert-message">
              Une voix réaliste engendre un surcoût de facturation.
            </p>
          )}

          <div className="vocalization-action">
            <div className="vocalization-action-vocalize">
              {messageToVocalize ? (
                <FaMicrophone
                  className="vocalization-action-icon"
                  onClick={sendToGTTS}
                />
              ) : (
                <FaMicrophone className="vocalization-action-icon-grey" />
              )}
              <p>Vocaliser votre message</p>
            </div>
            <div className="vocalization-action-test">
              {vocalisationFileName ? (
                <IoIosPlayCircle
                  onClick={play}
                  className="vocalization-action-icon"
                />
              ) : (
                <IoIosPlayCircle className="vocalization-action-icon-grey" />
              )}
              <p>Ecouter votre message</p>
              {playAudioTest()}
              <p className="audio-duration">
                {audio && `Durée : ${audioDuration || 'calcul...'}`}
              </p>
            </div>
            <div className="vocalization-action-download">
              {vocalisationFileName ? (
                <div>
                  <a href={downloadAudioFilePath}>
                    <ImFolderDownload className="vocalization-action-icon" />
                  </a>
                </div>
              ) : (
                <a href={downloadAudioFilePath}>
                  <ImFolderDownload className="vocalization-action-icon-grey" />
                </a>
              )}

              <p>Télécharger le fichier audio</p>
            </div>
            <div />
            <div className="vocalization-action-trySend">
              {vocalisationFileName ? (
                <FiPhoneIncoming
                  className="vocalization-action-icon"
                  onClick={handleClickOpen}
                />
              ) : (
                <FiPhoneIncoming className="vocalization-action-icon-grey" />
              )}
              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
              >
                <DialogTitle id="form-dialog-title">
                  Entrer un numéro
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Pour tester la vocalisation de votre message vers un numéro
                    mobile, merci d'inscrire ci-dessous un numéro de téléphone
                  </DialogContentText>
                  {/* <TextField
                  autoFocus
                  margin="dense"
                  id="tel"
                  label="Numéro de téléphone"
                  type="tel"
                  fullWidth
                  onChange={handleChangePhoneNumber}
                /> */}
                  <PhoneInput
                    country="fr"
                    value={phoneNumber}
                    onChange={handleChangePhoneNumber}
                  />

                  <small>
                    Exemple: <strong>33</strong>603190988 pour la France
                  </small>
                </DialogContent>
                <DialogActions>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      handleCancelPhoneNumber();
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sendVocalMessage();
                      handleClose();
                    }}
                    className={
                      phoneNumberTestCheck
                        ? 'vocalization-action-dialog-ok'
                        : 'vocalization-action-dialog-error'
                    }
                  >
                    Envoyer
                  </button>
                </DialogActions>
              </Dialog>

              <p>Tester un envoi</p>
            </div>
          </div>
        </div>
      </div>
      <div className="broadcast-list-body">
        <h3 className="broadcast-list-title">Liste de diffusion</h3>
        <div className="broadcast-list-frame">
          <div className="broadcast-list-title">
            <MdPermContactCalendar className="broadcast-icon" />
            <h2>Gérer votre liste de diffusion</h2>
            <h3>Ajoutez, modifiez ou suprimez un contact</h3>
          </div>

          <div className="broadcast-list-grid">
            <div className="broadcast-list-import">
              <AiOutlineImport className="broadcast-list-icon" />
              <p>Importer une liste de diffusion</p>
            </div>
            <div className="broadcast-list-export">
              <AiOutlineExport className="broadcast-list-icon" />
              <p>Exporter une liste de diffusion</p>
            </div>
          </div>
          <ContactsView className="broadcast-list-array" />
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
