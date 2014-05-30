using Breeze.ContextProvider.EF6;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WeAreReady.Models;
using Breeze.WebApi2;
using Breeze.ContextProvider;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace WeAreReady.Controllers
{
    [BreezeController]
    public class BreezeController : ApiController
    {
        EFContextProvider<WeAreReadyEntities> _db;
        public BreezeController()
        {
            _db = new EFContextProvider<WeAreReadyEntities>();
        }
        [HttpGet]
        public string Metadata()
        {
            return _db.Metadata();
        }
        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _db.SaveChanges(saveBundle);
        }
        [HttpGet]
        public IQueryable<UserProfile> GetUserProfiles()
        {
            return _db.Context.UserProfiles;
        }
        [HttpGet]
        public IQueryable<Log> GetLogs()
        {
            return _db.Context.Logs;
        }

        [HttpGet]
        public IHttpActionResult LoginUser(string Username, string Password)
        {
            var user = _db.Context.AppUsers.Where(w => w.Username == Username && w.Password == Password && w.IsActive == true).FirstOrDefault();
            if (null != user)
            {
                return Ok(user);
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public IHttpActionResult AddUserProfile(string firstName, string nfctag, int age, string gender, string SMSPackage, int firstCheckpoint, int appUserId, string lastName = "", string bloodGroup = "", string phonenumber = "", int groupcount = 1, string emergencyContact = "", string emergencyContactNumber = "", string medicalCondition = "")
        {
            var newUser = new UserProfile() { UserProfileId = Guid.NewGuid(), Age = age, AppUserId = appUserId, BloodGroup = bloodGroup, EmergencyContact = emergencyContact, EmergencyContactNumber = emergencyContactNumber, FirstCheckpointId = firstCheckpoint, FirstName = firstName, FirstScanDateTime = DateTime.Now, Gender = gender, GroupCount = groupcount, LastName = lastName, MedicalCondition = medicalCondition, NFCTagId = nfctag, PhoneNumber = phonenumber, SMSPackPurchased = SMSPackage };

            WeAreReadyEntities _db2 = new WeAreReadyEntities();
            var user = _db2.UserProfiles.Add(newUser);
            _db2.SaveChanges();
            if (null != user)
            {
                return Ok();
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public IHttpActionResult AddUser(int appRoleId, string userName, string password)
        {
            var newUser = new AppUser() { AppRoleId = appRoleId, IsActive=true, Password = password, Username =userName };
            WeAreReadyEntities _db2 = new WeAreReadyEntities();
            var user = _db2.AppUsers.Add(newUser);
            _db2.SaveChanges();
            if (null != user)
            {
                return Ok();
            }
            else
                return BadRequest();
        }
        [HttpGet]
        public IHttpActionResult AddLog(string nfctagid, int checkpointId, string action, int appuserid)
        {
            var userprofile = _db.Context.UserProfiles.Where(w => w.NFCTagId == nfctagid).FirstOrDefault();
            if (null != userprofile)
            {
                var log = new Log() { AppUserId = appuserid, Action = action, CheckPointId = checkpointId, LogTime = DateTime.Now, UserProfileId = userprofile.UserProfileId };
                WeAreReadyEntities _db2 = new WeAreReadyEntities();
                _db2.Logs.Add(log);
                _db2.SaveChanges();
                return Ok();
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public IHttpActionResult GetUserProfile(string NFCTagId)
        {
            var user = _db.Context.UserProfiles.Where(w => w.NFCTagId == NFCTagId).FirstOrDefault();
            if (null != user)
            {
                return Ok(user);
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public IHttpActionResult GetUserProfile(string firstname = "", string lastname = "", string phoneNumber = "", string EmergencyContact = "", string EmergencyContactNumber = "")
        {
            var users = _db.Context.UserProfiles.Where(w => w.FirstName.ToLower().Contains(firstname.ToLower())
                || w.LastName.ToLower().Contains(lastname.ToLower())
                || w.PhoneNumber.Contains(phoneNumber)
                || w.EmergencyContactNumber.Contains(phoneNumber)
                || w.EmergencyContact.ToLower().Contains(EmergencyContact.ToLower()));
            if (null != users)
            {
                return Ok(users);
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public IHttpActionResult GetUserLog(string UserId)
        {
            var logs = _db.Context.Logs.Where(w => w.UserProfileId == Guid.Parse(UserId));
            if (null != logs)
            {
                return Ok(logs);
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public IHttpActionResult GetCheckPoints()
        {
            return Ok(_db.Context.CheckPoints);
        }

    }
}